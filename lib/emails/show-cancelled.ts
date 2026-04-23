import { formatDate, formatTime } from "@/lib/format"
import type { ShowDetails } from "@/lib/types"

export interface ShowCancelledInput {
  showDetails: ShowDetails
  reason?: string
}

export function renderShowCancelledSubject(showDetails: ShowDetails): string {
  return `Show cancelled — ${showDetails.showTitle} at ${showDetails.venue}`
}

export function renderShowCancelledBody({ showDetails, reason }: ShowCancelledInput): string {
  const formattedDate = formatDate(showDetails.showDate)
  const formattedShowTime = formatTime(showDetails.showTime)

  return `Hi there,

Your show "${showDetails.showTitle}" at ${showDetails.venue} on ${formattedDate} at ${formattedShowTime} has been cancelled.

${reason ? `Reason: ${reason}\n\n` : ""}If you have questions or would like to reschedule, please reply to this email.

Thanks,
UCB Artistic Team`
}
