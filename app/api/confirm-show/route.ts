import { type NextRequest, NextResponse } from "next/server"
import { audit } from "@/lib/audit"
import { env } from "@/lib/env"
import { hasGoogleCredentials } from "@/lib/google"
import { createDriveFolder, createCalendarEvent, sendEmail } from "@/lib/google-actions"
import { renderShowConfirmationSubject } from "@/lib/emails"
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

function buildTechEventTitle(d: ShowDetails): string {
  return `${d.showTitle} - TECH`
}

function buildTechEventDescription(d: ShowDetails): string {
  return [
    `Tech rehearsal for: ${d.showTitle}`,
    `Venue: ${d.venue}`,
    `Producer: ${d.producerEmail}`,
  ].join("\n")
}

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

function formatLocalISO(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:00`
}

function computeStartEnd(d: ShowDetails): { startISO: string; endISO: string } {
  const startISO = `${d.showDate}T${d.showTime}:00`
  const start = new Date(startISO)
  const end = new Date(start.getTime() + DEFAULT_EVENT_DURATION_HOURS * 60 * 60 * 1000)
  // Format as local "YYYY-MM-DDTHH:mm:ss" — Google interprets in timeZone param.
  return { startISO, endISO: formatLocalISO(end) }
}

function computeTechStartEnd(d: ShowDetails): { startISO: string; endISO: string } | null {
  const tech = d.techRehearsal
  if (!tech.enabled || !tech.date || !tech.time || tech.durationMinutes <= 0) return null
  const startISO = `${tech.date}T${tech.time}:00`
  const start = new Date(startISO)
  const end = new Date(start.getTime() + tech.durationMinutes * 60 * 1000)
  return { startISO, endISO: formatLocalISO(end) }
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
    if (body.techRehearsal.enabled) {
      result.techRehearsalEvent = { status: "success", id: `${simId}-tech` }
    }
    audit.log("staff", "confirm-show", simId, {
      title: body.showTitle,
      venue: body.venue,
      date: body.showDate,
      producer: body.producerEmail,
      mode: "simulation",
      techRehearsal: body.techRehearsal.enabled,
    })
    return NextResponse.json(result)
  }

  // --- Live mode: run all actions in parallel, independently -----
  const { startISO, endISO } = computeStartEnd(body)
  const parentFolderId = VENUE_FOLDER_IDS[body.venue] || ""

  const subject = body.emailSubject?.trim() || renderShowConfirmationSubject(body)
  const emailBody = body.emailBody?.trim() || ""

  const techStartEnd = computeTechStartEnd(body)
  const techRehearsalPromise = techStartEnd
    ? createCalendarEvent({
        calendarId: UCB_CALENDAR_ID,
        summary: buildTechEventTitle(body),
        location: body.venue,
        description: buildTechEventDescription(body),
        startISO: techStartEnd.startISO,
        endISO: techStartEnd.endISO,
        timeZone: TIMEZONE,
      })
    : null

  const [driveFolder, calendarEvent, email, techRehearsalEvent] = await Promise.all([
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
    techRehearsalPromise ?? Promise.resolve(null),
  ])

  const result: ConfirmationResult = { email, calendarEvent, driveFolder }
  if (techRehearsalEvent) {
    result.techRehearsalEvent = techRehearsalEvent
  }

  reqLog.info("done", {
    email: email.status,
    calendar: calendarEvent.status,
    drive: driveFolder.status,
    techRehearsal: techRehearsalEvent?.status ?? "skipped",
  })

  audit.log("staff", "confirm-show", calendarEvent.id ?? driveFolder.id ?? requestId, {
    title: body.showTitle,
    venue: body.venue,
    date: body.showDate,
    producer: body.producerEmail,
    email: email.status,
    calendar: calendarEvent.status,
    drive: driveFolder.status,
    techRehearsal: techRehearsalEvent?.status ?? "skipped",
  })

  return NextResponse.json(result)
}
