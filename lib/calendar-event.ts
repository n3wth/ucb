import type { ShowDetails } from "./types"

function formatPrice(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`
}

export function buildEventSummary(d: ShowDetails): string {
  const prefix = d.digitalTicket.enabled ? "[LIVESTREAM] " : ""
  const presale = formatPrice(d.presaleTicketPrice)
  const door = formatPrice(d.doorTicketPrice)
  return `${prefix}${d.showTitle} (${presale}/${door})`
}
