import { formatDate, formatTime, formatPrice } from "@/lib/format"
import type { ShowDetails } from "@/lib/types"

export interface ShowConfirmationInput {
  showDetails: ShowDetails
  driveFolderUrl?: string
}

export const DRIVE_FOLDER_PLACEHOLDER = "A Google Drive folder will be created for your show materials."

export function renderShowConfirmationSubject(showDetails: ShowDetails): string {
  return `Your show at ${showDetails.venue} is confirmed — ${showDetails.showTitle}`
}

export function renderShowConfirmationBody({ showDetails, driveFolderUrl }: ShowConfirmationInput): string {
  const formattedDate = formatDate(showDetails.showDate)
  const formattedShowTime = formatTime(showDetails.showTime)
  const formattedTechTime = showDetails.techRehearsalTime ? formatTime(showDetails.techRehearsalTime) : "Not scheduled"

  const ticketLines = [
    `Presale: ${formatPrice(showDetails.presaleTicketPrice)}`,
    `Door: ${formatPrice(showDetails.doorTicketPrice)}`,
    showDetails.digitalTicket.enabled ? `Digital stream: ${formatPrice(showDetails.digitalTicket.price)}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  return `Hi there,

Your show "${showDetails.showTitle}" at ${showDetails.venue} is confirmed.

SHOW DETAILS
Date: ${formattedDate}
Show time: ${formattedShowTime}
Tech rehearsal: ${formattedTechTime}
Venue: ${showDetails.venue}

TICKET PRICING
${ticketLines}

SHOW FOLDER
${driveFolderUrl ? `Your show folder: ${driveFolderUrl}` : DRIVE_FOLDER_PLACEHOLDER}

Please review these details and reply if anything needs to be changed.

Thanks,
UCB Artistic Team`
}

// Replaces the placeholder line with the real folder URL so user edits in other
// sections are preserved. If the placeholder is not found (user removed or
// heavily rewrote the email), appends a SHOW FOLDER block so the link still
// reaches the producer.
export function injectDriveFolderUrl(body: string, driveFolderUrl: string): string {
  const replacement = `Your show folder: ${driveFolderUrl}`
  if (body.includes(DRIVE_FOLDER_PLACEHOLDER)) {
    return body.replace(DRIVE_FOLDER_PLACEHOLDER, replacement)
  }
  if (body.includes(replacement)) return body
  return `${body.trimEnd()}\n\nSHOW FOLDER\n${replacement}\n`
}
