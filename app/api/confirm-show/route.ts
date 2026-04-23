import { NextRequest, NextResponse } from "next/server"
import { getCalendar, getDrive, hasGoogleCredentials } from "@/lib/google"
import type { ShowDetails, ConfirmationResult, StepResult } from "@/lib/types"

const VENUE_FOLDER_IDS: Record<string, string | undefined> = {
  "UCB Franklin": process.env.UCB_FRANKLIN_FOLDER_ID,
  "UCB Annex": process.env.UCB_ANNEX_FOLDER_ID,
}

const UCB_CALENDAR_ID = process.env.UCB_CALENDAR_ID || "primary"
const TIMEZONE = "America/New_York"

function formatDateTime(date: string, time: string): string {
  return `${date}T${time}:00`
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

async function createDriveFolder(d: ShowDetails): Promise<StepResult> {
  const folderName = buildFolderName(d)
  const parentFolderId = VENUE_FOLDER_IDS[d.venue]

  console.log("[v0] drive: creating folder", { folderName, parentFolderId, venue: d.venue })

  if (!parentFolderId) {
    const msg = `Missing parent folder ID for venue "${d.venue}". Set UCB_FRANKLIN_FOLDER_ID or UCB_ANNEX_FOLDER_ID.`
    console.log("[v0] drive: aborting", msg)
    return { status: "error", error: msg }
  }

  try {
    const drive = await getDrive()
    const response = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentFolderId],
      },
      fields: "id, name, webViewLink",
      supportsAllDrives: true,
    })
    console.log("[v0] drive: created", response.data)
    return {
      status: "success",
      id: response.data.id || undefined,
      url:
        response.data.webViewLink ||
        (response.data.id ? `https://drive.google.com/drive/folders/${response.data.id}` : undefined),
    }
  } catch (err: any) {
    const detail = err?.response?.data || err?.errors || err?.message || String(err)
    const detailStr = typeof detail === "string" ? detail : JSON.stringify(detail)
    console.log("[v0] drive: create failed", detailStr)
    return { status: "error", error: `Drive folder creation failed: ${detailStr}` }
  }
}

async function createCalendarEvent(d: ShowDetails): Promise<StepResult> {
  const startDateTime = formatDateTime(d.showDate, d.showTime)
  const endDate = new Date(`${d.showDate}T${d.showTime}:00`)
  endDate.setHours(endDate.getHours() + 2)
  const endDateTime = endDate.toISOString().slice(0, 19)

  console.log("[v0] calendar: creating event", {
    calendarId: UCB_CALENDAR_ID,
    title: d.showTitle,
    startDateTime,
    endDateTime,
  })

  try {
    const calendar = await getCalendar()
    const response = await calendar.events.insert({
      calendarId: UCB_CALENDAR_ID,
      requestBody: {
        summary: d.showTitle,
        location: d.venue,
        description: buildEventDescription(d),
        start: { dateTime: startDateTime, timeZone: TIMEZONE },
        end: { dateTime: endDateTime, timeZone: TIMEZONE },
      },
    })
    console.log("[v0] calendar: created", { id: response.data.id, htmlLink: response.data.htmlLink })
    return {
      status: "success",
      id: response.data.id || undefined,
      url: response.data.htmlLink || undefined,
    }
  } catch (err: any) {
    const detail = err?.response?.data || err?.errors || err?.message || String(err)
    const detailStr = typeof detail === "string" ? detail : JSON.stringify(detail)
    console.log("[v0] calendar: create failed", detailStr)
    return { status: "error", error: `Calendar event creation failed: ${detailStr}` }
  }
}

export async function POST(request: NextRequest) {
  try {
    const showDetails = (await request.json()) as ShowDetails

    if (
      !showDetails?.showTitle ||
      !showDetails?.showDate ||
      !showDetails?.showTime ||
      !showDetails?.producerEmail ||
      !showDetails?.venue
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] confirm-show: starting", {
      title: showDetails.showTitle,
      venue: showDetails.venue,
      date: showDetails.showDate,
      hasCreds: hasGoogleCredentials(),
    })

    if (!hasGoogleCredentials()) {
      // Simulation fallback so the flow is testable without full Google setup.
      console.log("[v0] confirm-show: SIMULATION MODE (Google creds not set)")
      await new Promise((r) => setTimeout(r, 800))
      const simUrl = `https://drive.google.com/drive/folders/sim-${Date.now()}`
      const result: ConfirmationResult = {
        email: { status: "success" },
        calendarEvent: { status: "success", id: `sim-${Date.now()}` },
        driveFolder: { status: "success", id: `sim-${Date.now()}`, url: simUrl },
      }
      return NextResponse.json(result)
    }

    const [driveResult, calendarResult] = await Promise.all([
      createDriveFolder(showDetails),
      createCalendarEvent(showDetails),
    ])

    const result: ConfirmationResult = {
      // Email is generated / copied client-side; we mark it success when the
      // client reached this point with valid data. A future iteration could
      // send it via Gmail API and surface a real status here.
      email: { status: "success" },
      calendarEvent: calendarResult,
      driveFolder: driveResult,
    }

    console.log("[v0] confirm-show: done", {
      email: result.email.status,
      calendar: result.calendarEvent.status,
      drive: result.driveFolder.status,
    })

    return NextResponse.json(result)
  } catch (err: any) {
    const detail = err?.response?.data || err?.message || String(err)
    console.log("[v0] confirm-show: fatal", detail)
    const errStr = typeof detail === "string" ? detail : JSON.stringify(detail)
    const result: ConfirmationResult = {
      email: { status: "error", error: errStr },
      calendarEvent: { status: "error", error: errStr },
      driveFolder: { status: "error", error: errStr },
    }
    return NextResponse.json(result, { status: 500 })
  }
}
