import { formatPrice } from "@/lib/format"
import type { ShowDetails } from "@/lib/types"

export function buildCalendarEventSummary(d: Pick<ShowDetails, 'showTitle' | 'presaleTicketPrice' | 'doorTicketPrice' | 'digitalTicket'>): string {
  const prices = `(${formatPrice(d.presaleTicketPrice)}/${formatPrice(d.doorTicketPrice)})`
  const title = `${d.showTitle} ${prices}`
  return d.digitalTicket.enabled ? `[LIVESTREAM] ${title}` : title
}
