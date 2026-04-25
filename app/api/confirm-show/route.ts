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
import { computeStartEnd } from "@/lib/show-time"
import { UCB_TIMEZONE } from "@/lib/format"
import { buildCalendarEventSummary } from "@/lib/calendar-event"
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
const TIMEZONE = UCB_TIMEZONE

function buildFolderName(d: ShowDetails): string {
  return `${d.showTitle} – ${d.showDate}`
}

function dedupeRecipients(
  emails: string[] | undefined,
  exclude: Iterable<string>,
): string[] | undefined {
  if (!emails?.length) return undefined
  const seen = new Set<string>()
  for (const e of exclude) {
    const k = e.trim().toLowerCase()
    if (k) seen.add(k)
  }
  const out: string[] = []
  for (const raw of emails) {
    const addr = raw.trim()
    if (!addr) continue
    const key = addr.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(addr)
  }
  return out.length ? out : undefined
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

function buildTechEventDescription(d: ShowDetails): string {
  return [
    `Tech rehearsal for: ${d.showTitle}`,
    `Venue: ${d.venue}`,
    `Producer: ${d.producerEmail}`,
    `Show time: ${d.showTime}`,
  ].join("\n")
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

  const hasTechRehearsal = body.techRehearsalTime.trim().length > 0

  // --- Simulation mode (no Google creds) -------------------------------
  if (!hasGoogleCredentials()) {
    reqLog.warn("SIMULATION MODE — GOOGLE_* env vars not fully set")
    await new Promise((r) => setTimeout(r, 600))
    const simId = `sim-${Date.now()}`
    const result: ConfirmationResult = {
      email: { status: "success", id: simId },
      calendarEvent: { status: "success", id: simId },
      techCalendarEvent: hasTechRehearsal
        ? { status: "success", id: `${simId}-tech` }
        : undefined,
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
      techRehearsal: hasTechRehearsal,
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

  const techEventPromise = hasTechRehearsal
    ? (() => {
        const { startISO: techStartISO, endISO: techEndISO } = computeStartEnd({
          showDate: body.showDate,
          showTime: body.techRehearsalTime,
          durationMinutes: body.techRehearsalDurationMinutes,
        })
        return createCalendarEvent({
          calendarId: UCB_CALENDAR_ID,
          summary: `${body.showTitle} - TECH`,
          location: body.venue,
          description: buildTechEventDescription(body),
          startISO: techStartISO,
          endISO: techEndISO,
          timeZone: TIMEZONE,
        })
      })()
    : Promise.resolve(undefined)

  const [calendarEvent, email, techCalendarEvent] = await Promise.all([
    createCalendarEvent({
      calendarId: UCB_CALENDAR_ID,
      summary: buildCalendarEventSummary(body),
      location: body.venue,
      description: buildEventDescription(body),
      startISO,
      endISO,
      timeZone: TIMEZONE,
    }),
    finalEmailBody
      ? (() => {
          const cc = dedupeRecipients(body.ccEmails, [body.producerEmail])
          const bcc = dedupeRecipients(body.bccEmails, [body.producerEmail, ...(cc ?? [])])
          return sendEmail({
            to: body.producerEmail,
            subject,
            body: finalEmailBody,
            cc,
            bcc,
          })
        })()
      : Promise.resolve({
          status: "error",
          error: "No email body was provided.",
        } as const),
    techEventPromise,
  ])

  const result: ConfirmationResult = {
    email,
    calendarEvent,
    techCalendarEvent,
    driveFolder,
  }

  reqLog.info("done", {
    email: email.status,
    calendar: calendarEvent.status,
    techCalendar: techCalendarEvent?.status,
    drive: driveFolder.status,
  })

  audit.log("staff", "confirm-show", calendarEvent.id ?? driveFolder.id ?? requestId, {
    title: body.showTitle,
    venue: body.venue,
    date: body.showDate,
    producer: body.producerEmail,
    ccCount: body.ccEmails?.length ?? 0,
    bccCount: body.bccEmails?.length ?? 0,
    email: email.status,
    calendar: calendarEvent.status,
    techCalendar: techCalendarEvent?.status,
    drive: driveFolder.status,
  })

  return NextResponse.json(result)
}
