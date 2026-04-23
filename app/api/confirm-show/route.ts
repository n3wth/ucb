import { type NextRequest, NextResponse } from "next/server"
import { hasGoogleCredentials } from "@/lib/google"
import { createDriveFolder, createCalendarEvent, sendEmail } from "@/lib/google-actions"
import { createLogger } from "@/lib/logger"
import { RateLimiter, hashKey } from "@/lib/rate-limit"
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
  "UCB Franklin": process.env.UCB_FRANKLIN_FOLDER_ID,
  "UCB Annex": process.env.UCB_ANNEX_FOLDER_ID,
}

const UCB_CALENDAR_ID = process.env.UCB_CALENDAR_ID || "primary"
const TIMEZONE = "America/New_York"
const DEFAULT_EVENT_DURATION_HOURS = 2

interface ConfirmShowRequest extends ShowDetails {
  emailSubject?: string
  emailBody?: string
}

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

function defaultEmailSubject(d: ShowDetails): string {
  return `Your show at ${d.venue} is confirmed — ${d.showTitle}`
}

function validate(body: ConfirmShowRequest): string | null {
  if (!body?.showTitle) return "showTitle is required"
  if (!body?.showDate) return "showDate is required"
  if (!body?.showTime) return "showTime is required"
  if (!body?.venue) return "venue is required"
  if (!body?.producerEmail) return "producerEmail is required"
  if (!/.+@.+\..+/.test(body.producerEmail)) return "producerEmail is invalid"
  return null
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

  let body: ConfirmShowRequest
  try {
    body = (await request.json()) as ConfirmShowRequest
  } catch (err) {
    reqLog.error("invalid JSON", err)
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const validationError = validate(body)
  if (validationError) {
    reqLog.warn("validation failed", { validationError })
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

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
    return NextResponse.json(result)
  }

  // --- Live mode: run all three actions in parallel, independently -----
  const { startISO, endISO } = computeStartEnd(body)
  const parentFolderId = VENUE_FOLDER_IDS[body.venue] || ""

  const subject = body.emailSubject?.trim() || defaultEmailSubject(body)
  const emailBody = body.emailBody?.trim() || ""

  const [driveFolder, calendarEvent, email] = await Promise.all([
    createDriveFolder({
      name: buildFolderName(body),
      parentFolderId,
    }),
    createCalendarEvent({
      calendarId: UCB_CALENDAR_ID,
      summary: body.showTitle,
      location: body.venue,
      description: buildEventDescription(body),
      startISO,
      endISO,
      timeZone: TIMEZONE,
    }),
    emailBody
      ? sendEmail({
          to: body.producerEmail,
          subject,
          body: emailBody,
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

  return NextResponse.json(result)
}
