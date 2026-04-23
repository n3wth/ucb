import { NextResponse } from "next/server"
import { env } from "@/lib/env"
import { hasGoogleCredentials } from "@/lib/google"
import { listCalendarEvents, type CalendarEventSummary } from "@/lib/google-actions"
import { createLogger } from "@/lib/logger"
import type { ShowListItem, ShowListResponse } from "@/lib/types"

const log = createLogger("shows-list")

const UCB_CALENDAR_ID = env.UCB_CALENDAR_ID || "primary"
const WINDOW_DAYS = 60

// Pull the "Venue: ..." and "Producer: ..." lines out of the event description
// that confirm-show writes. Falls back to the raw location string for venue.
function parseEventMetadata(event: CalendarEventSummary): { venue: string; producer: string } {
  const lines = (event.description || "").split(/\r?\n/)
  let venue = event.location || ""
  let producer = ""
  for (const line of lines) {
    const venueMatch = line.match(/^\s*Venue:\s*(.+)$/i)
    if (venueMatch) venue = venueMatch[1].trim()
    const producerMatch = line.match(/^\s*Producer:\s*(.+)$/i)
    if (producerMatch) producer = producerMatch[1].trim()
  }
  return { venue, producer }
}

function toShowListItem(event: CalendarEventSummary): ShowListItem {
  const { venue, producer } = parseEventMetadata(event)
  return {
    id: event.id,
    title: event.summary,
    startISO: event.startISO,
    venue,
    producer,
    link: event.htmlLink,
  }
}

export async function GET() {
  const now = new Date()
  const past = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000)
  const future = new Date(now.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000)

  if (!hasGoogleCredentials()) {
    log.warn("SIMULATION MODE — GOOGLE_* env vars not fully set")
    const body: ShowListResponse = { shows: [] }
    return NextResponse.json(body)
  }

  const result = await listCalendarEvents({
    calendarId: UCB_CALENDAR_ID,
    timeMin: past.toISOString(),
    timeMax: future.toISOString(),
  })

  if (result.status === "error") {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  const body: ShowListResponse = { shows: result.events.map(toShowListItem) }
  return NextResponse.json(body)
}
