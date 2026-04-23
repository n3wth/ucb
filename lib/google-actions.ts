// Modular, independently-failing Google Workspace actions.
//
// Each action:
//   - Authenticates via OAuth2 (refresh-token flow, see lib/google.ts)
//   - Retries on 429/5xx with exponential backoff + Retry-After
//   - Emits structured [v0] logs for every API boundary
//   - Never throws — returns a StepResult { status, id?, url?, error? }
//   - Is safe to Promise.all — one failure does not block the others
//
// Intended to be composed inside a single API route (see
// /app/api/confirm-show/route.ts) or any serverless function.

import { getCalendar, getDrive, getGmail } from "./google"
import { createLogger, describeError } from "./logger"
import { withRetry } from "./retry"
import type { StepResult } from "./types"

// ---------- Drive ----------

export interface CreateDriveFolderInput {
  name: string
  parentFolderId: string
}

export async function createDriveFolder(input: CreateDriveFolderInput): Promise<StepResult> {
  const log = createLogger("drive")
  log.info("create folder: start", { name: input.name, parentFolderId: input.parentFolderId })

  if (!input.parentFolderId) {
    const error = "Missing parent folder ID (set UCB_FRANKLIN_FOLDER_ID / UCB_ANNEX_FOLDER_ID)."
    log.error("create folder: aborting", error)
    return { status: "error", error }
  }

  try {
    const drive = await getDrive()
    const response = await withRetry(
      () =>
        drive.files.create({
          requestBody: {
            name: input.name,
            mimeType: "application/vnd.google-apps.folder",
            parents: [input.parentFolderId],
          },
          fields: "id, name, webViewLink",
          supportsAllDrives: true,
        }),
      { label: "drive.files.create" },
    )

    const id = response.data.id || undefined
    const url =
      response.data.webViewLink ||
      (id ? `https://drive.google.com/drive/folders/${id}` : undefined)

    log.info("create folder: success", { id, url })
    return { status: "success", id, url }
  } catch (err) {
    const error = describeError(err)
    log.error("create folder: failed", err)
    return { status: "error", error }
  }
}

// ---------- Calendar ----------

export interface CreateCalendarEventInput {
  calendarId: string
  summary: string
  location?: string
  description?: string
  startISO: string // "YYYY-MM-DDTHH:mm:ss"
  endISO: string
  timeZone: string
  attendees?: string[]
}

export async function createCalendarEvent(input: CreateCalendarEventInput): Promise<StepResult> {
  const log = createLogger("calendar")
  log.info("create event: start", {
    calendarId: input.calendarId,
    summary: input.summary,
    startISO: input.startISO,
    endISO: input.endISO,
  })

  try {
    const calendar = await getCalendar()
    const response = await withRetry(
      () =>
        calendar.events.insert({
          calendarId: input.calendarId,
          sendUpdates: "none",
          requestBody: {
            summary: input.summary,
            location: input.location,
            description: input.description,
            start: { dateTime: input.startISO, timeZone: input.timeZone },
            end: { dateTime: input.endISO, timeZone: input.timeZone },
            attendees: input.attendees?.map((email) => ({ email })),
          },
        }),
      { label: "calendar.events.insert" },
    )

    log.info("create event: success", {
      id: response.data.id,
      htmlLink: response.data.htmlLink,
    })
    return {
      status: "success",
      id: response.data.id || undefined,
      url: response.data.htmlLink || undefined,
    }
  } catch (err) {
    const error = describeError(err)
    log.error("create event: failed", err)
    return { status: "error", error }
  }
}

// ---------- Gmail ----------

export interface SendEmailInput {
  to: string
  subject: string
  body: string
  from?: string // optional; defaults to "me" (authenticated sender)
  cc?: string[]
  bcc?: string[]
}

// RFC 2822 message, base64url encoded, as Gmail expects.
function buildRawMessage(input: SendEmailInput): string {
  const headers: string[] = []
  if (input.from) headers.push(`From: ${input.from}`)
  headers.push(`To: ${input.to}`)
  if (input.cc?.length) headers.push(`Cc: ${input.cc.join(", ")}`)
  if (input.bcc?.length) headers.push(`Bcc: ${input.bcc.join(", ")}`)
  headers.push("MIME-Version: 1.0")
  headers.push('Content-Type: text/plain; charset="UTF-8"')
  headers.push("Content-Transfer-Encoding: 7bit")
  headers.push(`Subject: ${input.subject}`)

  const message = headers.join("\r\n") + "\r\n\r\n" + input.body

  // Gmail requires URL-safe base64 (no padding issues with +/ vs -_)
  return Buffer.from(message, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

export async function sendEmail(input: SendEmailInput): Promise<StepResult> {
  const log = createLogger("gmail")
  log.info("send: start", {
    to: input.to,
    subject: input.subject,
    cc: input.cc,
    bodyLength: input.body.length,
  })

  try {
    const gmail = await getGmail()
    const raw = buildRawMessage(input)
    const response = await withRetry(
      () =>
        gmail.users.messages.send({
          userId: "me",
          requestBody: { raw },
        }),
      { label: "gmail.users.messages.send" },
    )

    log.info("send: success", { id: response.data.id, threadId: response.data.threadId })
    return {
      status: "success",
      id: response.data.id || undefined,
      url: response.data.id ? `https://mail.google.com/mail/u/0/#sent/${response.data.id}` : undefined,
    }
  } catch (err) {
    const error = describeError(err)
    log.error("send: failed", err)
    return { status: "error", error }
  }
}
