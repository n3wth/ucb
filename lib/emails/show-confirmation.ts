import { formatDate, formatTime, formatPrice } from "@/lib/format"
import type { ShowDetails } from "@/lib/types"

export interface ShowConfirmationInput {
  showDetails: ShowDetails
  driveFolderUrl?: string
}

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
${driveFolderUrl ? `Your show folder: ${driveFolderUrl}` : "A Google Drive folder will be created for your show materials."}

Please review these details and reply if anything needs to be changed.

Thanks,
UCB Artistic Team`
}
