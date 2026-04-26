/**
 * Shared formatting utilities for dates, times, and currency.
 * All date/time display is rendered in Pacific Time — UCB is LA-based.
 */

export const UCB_TIMEZONE = "America/Los_Angeles"

export function formatDate(dateString: string): string {
  if (!dateString) return ""
  const date = new Date(dateString + "T12:00:00Z")
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: UCB_TIMEZONE,
  })
}

export function formatShortDate(dateString: string): string {
  if (!dateString) return ""
  const date = new Date(dateString + "T12:00:00Z")
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: UCB_TIMEZONE,
  })
}

export function formatTime(timeString: string): string {
  if (!timeString) return ""
  const [hours, minutes] = timeString.split(":")
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

/**
 * Splits an ISO date-time string into calendar date and `HH:MM` (24h) time.
 * Used for audit timestamps and show start times.
 */
export function splitIsoDateTime(iso: string): { date: string; time: string } {
  const [date, timePart] = iso.split("T")
  if (!timePart) return { date, time: "" }
  const [hh, mm] = timePart.split(":")
  return { date, time: `${hh}:${mm}` }
}

export function addMinutesToTime(timeString: string, minutes: number): string {
  if (!timeString) return ""
  const [hours, mins] = timeString.split(":").map(Number)
  const total = hours * 60 + mins + minutes
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

export function formatPriceRange(low: number, high: number): string {
  if (low === high) return formatPrice(low)
  return `${formatPrice(low)} - ${formatPrice(high)}`
}
