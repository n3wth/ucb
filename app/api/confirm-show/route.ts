import { type NextRequest, NextResponse } from "next/server"
import { audit } from "@/lib/audit"
import { env } from "@/lib/env"
import { hasGoogleCredentials } from "@/lib/google"
import { createDriveFolder, createCalendarEvent, sendEmail } from "@/lib/google-actions"
import { renderShowConfirmationSubject, injectDriveFolderUrl } from "@/lib/emails"
import { createLogger } from "@/lib/logger"
import { RateLimiter, hashKey } from "@/lib/rate-limit"
import { confirmShowRequestSchema, type ConfirmShowRequest } from "@/lib/schemas"
import { SESSION_COOKIE } from "@/lib/session"
import type { ShowDetails, ConfirmationResult } from "@/lib/types"

const log = createLogger("confirm-show")

// Per-user token bucket. Keyed on hashed session cookie — the auth middleware
// guarantees an authed session by the time we reach here. Fallback key uses
// forwarded IP so an unexpectedly missing cookie still gets limited.
const confirmShowLimiter = new RateLimiter({
  rules: [
    { windowMs: 10_000, max: 1 },
    { windowMs: 60 * 60 * 1000, max: 30 },
  ],
})

async function rateLimitKey(request: NextRequest): Promise<string> {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (token) return `s:${await hashKey(token)}`
  const fwd = request.headers.get("x-forwarded-for") ?? ""
  const ip = fwd.split(",")[0]?.trim() || "unknown"
  return `ip:${ip}`
}

const VENUE_FOLDER_IDS: Record<string, string | undefined> = {
  "UCB Franklin": env.UCB_FRANKLIN_FOLDER_ID,
  "UCB Annex": env.UCB_ANNEX_FOLDER_ID,
}

const UCB_CALENDAR_ID = env.UCB_CALENDAR_ID || "primary"
const TIMEZONE = "America/New_York"
const DEFAULT_EVENT_DURATION_HOURS = 2

function buildFolderName(d: ShowDetails): string {
  return `${d.showTitle} – ${d.showDate}`
}

function buildEventDescription(d: ShowDetails): string {
  return [
    `Venue: ${d.venue}`,
    `Producer: ${d.producerEmail}`,
    `Presale: $${d.presaleTicketPrice.toFixed(2)}`,
    `Door: $${d.doorTicketPrice.toFixed(2)}`,
    d.digitalTicket.enabled ? `Digital: $${d.digitalTicket.price.toFixed(2)}` : "",
    d.techRehearsalTime ? `Tech Rehearsal: ${d.techRehearsalTime}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

function computeStartEnd(d: ShowDetails): { startISO: string; endISO: string } {
  const startISO = `${d.showDate}T${d.showTime}:00`
  const start = new Date(startISO)
  const end = new Date(start.getTime() + DEFAULT_EVENT_DURATION_HOURS * 60 * 60 * 1000)
  // Format as local "YYYY-MM-DDTHH:mm:ss" — Google interprets in timeZone param.
  const pad = (n: number) => String(n).padStart(2, "0")
  const endISO = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}:00`
  return { startISO, endISO }
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const reqLog = log.child(requestId.slice(0, 8))

  const limitCheck = confirmShowLimiter.check(await rateLimitKey(request))
  if (!limitCheck.allowed) {
    reqLog.warn("rate limited", { retryAfter: limitCheck.retryAfterSeconds })
    return NextResponse.json(
      {
        error: "Too many requests. Please wait before trying again.",
        retryAfter: limitCheck.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limitCheck.retryAfterSeconds),
          "X-RateLimit-Limit": String(limitCheck.limit),
          "X-RateLimit-Remaining": "0",
        },
      },
    )
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch (err) {
    reqLog.error("invalid JSON", err)
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = confirmShowRequestSchema.safeParse(rawBody)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    const validationError = firstIssue?.message ?? "Invalid request body"
    reqLog.warn("validation failed", { validationError, issues: parsed.error.issues })
    return NextResponse.json({ error: validationError }, { status: 400 })
  }
  const body: ConfirmShowRequest = parsed.data

  reqLog.info("starting", {
    title: body.showTitle,
    venue: body.venue,
    date: body.showDate,
    hasCreds: hasGoogleCredentials(),
  })

  // --- Simulation mode (no Google creds) -------------------------------
  if (!hasGoogleCredentials()) {
    reqLog.warn("SIMULATION MODE — GOOGLE_* env vars not fully set")
    await new Promise((r) => setTimeout(r, 600))
    const simId = `sim-${Date.now()}`
    const result: ConfirmationResult = {
      email: { status: "success", id: simId },
      calendarEvent: { status: "success", id: simId },
      driveFolder: {
        status: "success",
        id: simId,
        url: `https://drive.google.com/drive/folders/${simId}`,
      },
    }
    audit.log("staff", "confirm-show", simId, {
      title: body.showTitle,
      venue: body.venue,
      date: body.showDate,
      producer: body.producerEmail,
      mode: "simulation",
    })
    return NextResponse.json(result)
  }

  // --- Live mode -------------------------------------------------------
  // Drive folder is created first so its URL can be injected into the email
  // body before sending. Calendar + email still run in parallel to each other.
  const { startISO, endISO } = computeStartEnd(body)
  const parentFolderId = VENUE_FOLDER_IDS[body.venue] || ""

  const subject = body.emailSubject?.trim() || renderShowConfirmationSubject(body)
  const emailBody = body.emailBody?.trim() || ""

  const driveFolder = await createDriveFolder({
    name: buildFolderName(body),
    parentFolderId,
  })

  const finalEmailBody =
    emailBody && driveFolder.status === "success" && driveFolder.url
      ? injectDriveFolderUrl(emailBody, driveFolder.url)
      : emailBody

  const [calendarEvent, email] = await Promise.all([
    createCalendarEvent({
      calendarId: UCB_CALENDAR_ID,
      summary: body.showTitle,
      location: body.venue,
      description: buildEventDescription(body),
      startISO,
      endISO,
      timeZone: TIMEZONE,
    }),
    finalEmailBody
      ? sendEmail({
          to: body.producerEmail,
          subject,
          body: finalEmailBody,
        })
      : Promise.resolve({
          status: "error",
          error: "No email body was provided.",
        } as const),
  ])

  const result: ConfirmationResult = { email, calendarEvent, driveFolder }

  reqLog.info("done", {
    email: email.status,
    calendar: calendarEvent.status,
    drive: driveFolder.status,
  })

  audit.log("staff", "confirm-show", calendarEvent.id ?? driveFolder.id ?? requestId, {
    title: body.showTitle,
    venue: body.venue,
    date: body.showDate,
    producer: body.producerEmail,
    email: email.status,
    calendar: calendarEvent.status,
    drive: driveFolder.status,
  })

  return NextResponse.json(result)
}
