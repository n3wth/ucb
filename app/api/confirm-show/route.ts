import { NextRequest, NextResponse } from "next/server"
import { getCalendarClient, getDriveClient } from "@/lib/google"
import type { ShowDetails, ConfirmationResult } from "@/lib/types"

// Parent folder IDs for each venue (set these in environment variables)
const VENUE_FOLDER_IDS: Record<string, string> = {
  "UCB Franklin": process.env.UCB_FRANKLIN_FOLDER_ID || "",
  "UCB Annex": process.env.UCB_ANNEX_FOLDER_ID || "",
}

// Calendar ID for the shared UCB calendar
const UCB_CALENDAR_ID = process.env.UCB_CALENDAR_ID || "primary"

function formatDateForFolder(dateString: string): string {
  // Convert YYYY-MM-DD to folder name format
  return dateString
}

function formatDateTime(date: string, time: string): string {
  // Combine date and time into ISO format
  return `${date}T${time}:00`
}

async function createDriveFolder(showDetails: ShowDetails): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const drive = getDriveClient()
    const folderName = `${showDetails.showTitle} – ${showDetails.showDate}`
    const parentFolderId = VENUE_FOLDER_IDS[showDetails.venue]

    const fileMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      ...(parentFolderId && { parents: [parentFolderId] }),
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id, webViewLink",
    })

    return {
      success: true,
      url: response.data.webViewLink || `https://drive.google.com/drive/folders/${response.data.id}`,
    }
  } catch (error) {
    console.error("Error creating Drive folder:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create Drive folder",
    }
  }
}

async function createCalendarEvent(showDetails: ShowDetails): Promise<{ success: boolean; error?: string }> {
  try {
    const calendar = getCalendarClient()

    // Create event start and end times
    const startDateTime = formatDateTime(showDetails.showDate, showDetails.showTime)
    // Assume show duration of 2 hours
    const endTime = new Date(`${showDetails.showDate}T${showDetails.showTime}:00`)
    endTime.setHours(endTime.getHours() + 2)
    const endDateTime = endTime.toISOString()

    const eventDescription = [
      `Venue: ${showDetails.venue}`,
      `Producer: ${showDetails.producerEmail}`,
      `Presale: $${showDetails.presaleTicketPrice.toFixed(2)}`,
      `Door: $${showDetails.doorTicketPrice.toFixed(2)}`,
      showDetails.techRehearsalTime ? `Tech Rehearsal: ${showDetails.techRehearsalTime}` : "",
      showDetails.liveStream ? "Live Stream: Yes" : "",
    ].filter(Boolean).join("\n")

    const event = {
      summary: showDetails.showTitle,
      location: showDetails.venue,
      description: eventDescription,
      start: {
        dateTime: startDateTime,
        timeZone: "America/New_York",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "America/New_York",
      },
    }

    await calendar.events.insert({
      calendarId: UCB_CALENDAR_ID,
      requestBody: event,
    })

    return { success: true }
  } catch (error) {
    console.error("Error creating calendar event:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create calendar event",
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const showDetails: ShowDetails = await request.json()

    // Validate required fields
    if (!showDetails.showTitle || !showDetails.showDate || !showDetails.showTime || !showDetails.producerEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const errors: string[] = []

    // Create Google Drive folder
    const driveResult = await createDriveFolder(showDetails)
    if (!driveResult.success) {
      errors.push(driveResult.error || "Drive folder creation failed")
    }

    // Create Google Calendar event
    const calendarResult = await createCalendarEvent(showDetails)
    if (!calendarResult.success) {
      errors.push(calendarResult.error || "Calendar event creation failed")
    }

    const result: ConfirmationResult = {
      emailGenerated: true, // Email is generated client-side
      calendarEventCreated: calendarResult.success,
      driveFolderCreated: driveResult.success,
      driveFolderUrl: driveResult.url,
      errors: errors.length > 0 ? errors : undefined,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing show confirmation:", error)
    return NextResponse.json(
      {
        emailGenerated: false,
        calendarEventCreated: false,
        driveFolderCreated: false,
        errors: [error instanceof Error ? error.message : "Unknown error occurred"],
      },
      { status: 500 }
    )
  }
}
