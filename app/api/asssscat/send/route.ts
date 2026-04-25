import { type NextRequest, NextResponse } from "next/server"
import { hasGoogleCredentials } from "@/lib/google"
import { sendEmail } from "@/lib/google-actions"
import {
  ASSSSCAT_TO,
  renderAsssscatBody,
  renderAsssscatSubject,
} from "@/lib/emails"
import { createLogger } from "@/lib/logger"
import { RateLimiter, hashKey } from "@/lib/rate-limit"
import { sendAsssscatRequestSchema, type SendAsssscatRequest } from "@/lib/schemas"
import { SESSION_COOKIE } from "@/lib/session"
import type { StepResult } from "@/lib/types"

const log = createLogger("asssscat-send")

const asssscatLimiter = new RateLimiter({
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

function dedupeBcc(emails: string[], exclude: Iterable<string>): string[] {
  const excluded = new Set(Array.from(exclude, (e) => e.trim().toLowerCase()))
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of emails) {
    const addr = raw.trim()
    if (!addr) continue
    const key = addr.toLowerCase()
    if (excluded.has(key)) continue
    if (seen.has(key)) continue
    seen.add(key)
    out.push(addr)
  }
  return out
}

function dedupeCc(emails: string[], exclude: Iterable<string>): string[] {
  return dedupeBcc(emails, exclude)
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const reqLog = log.child(requestId.slice(0, 8))

  const limitCheck = asssscatLimiter.check(await rateLimitKey(request))
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

  const parsed = sendAsssscatRequestSchema.safeParse(rawBody)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    const validationError = firstIssue?.message ?? "Invalid request body"
    reqLog.warn("validation failed", { validationError, issues: parsed.error.issues })
    return NextResponse.json({ error: validationError }, { status: 400 })
  }
  const body: SendAsssscatRequest = parsed.data

  if (body.improvisers.length < 6 && !body.smallCastAcknowledged) {
    return NextResponse.json(
      { error: "Cast is smaller than 6 — confirm before sending." },
      { status: 400 },
    )
  }

  reqLog.info("starting", {
    showDate: body.showDate,
    improvisers: body.improvisers.length,
    hasCreds: hasGoogleCredentials(),
  })

  const subject = body.emailSubject?.trim() || renderAsssscatSubject({
    showDate: body.showDate,
    improvisers: body.improvisers,
    monologist: body.monologist,
    ticketLink: body.ticketLink,
    oneTimeCc: body.oneTimeCc,
    defaultCc: body.defaultCc,
  })
  const emailBody =
    body.emailBody?.trim() ||
    renderAsssscatBody({
      showDetails: {
        showDate: body.showDate,
        improvisers: body.improvisers,
        monologist: body.monologist,
        ticketLink: body.ticketLink,
        oneTimeCc: body.oneTimeCc,
        defaultCc: body.defaultCc,
      },
    })

  const improviserEmails = body.improvisers.map((p) => p.email)
  const bcc = dedupeBcc([...improviserEmails, ...body.oneTimeBcc], [ASSSSCAT_TO])
  const cc = dedupeCc([...body.defaultCc, ...body.oneTimeCc], [ASSSSCAT_TO, ...bcc])

  if (!hasGoogleCredentials()) {
    reqLog.warn("SIMULATION MODE — GOOGLE_* env vars not fully set")
    await new Promise((r) => setTimeout(r, 400))
    const simId = `sim-${Date.now()}`
    const result: StepResult = { status: "success", id: simId }
    return NextResponse.json({ email: result })
  }

  const email = await sendEmail({
    to: ASSSSCAT_TO,
    subject,
    body: emailBody,
    cc: cc.length ? cc : undefined,
    bcc: bcc.length ? bcc : undefined,
  })

  reqLog.info("done", { email: email.status })

  return NextResponse.json({ email })
}
