/**
 * Centralized app configuration.
 * Add new venues or change defaults here instead of scattering magic strings.
 */

export const APP_NAME = "UCB Bookings"
export const APP_TAGLINE = "Internal tools for the UCB artistic team."

export interface Venue {
  id: string
  name: string
  label: string
}

export const VENUES = [
  { id: "franklin", name: "UCB Franklin", label: "Franklin" },
  { id: "annex", name: "UCB Annex", label: "Annex" },
] as const satisfies readonly Venue[]

export type VenueName = (typeof VENUES)[number]["name"]

export const DEFAULT_VENUE: VenueName = VENUES[0].name

export const DEFAULT_DIGITAL_PRICE = 10

export const SHOW_DURATION_PRESETS = [60, 90, 120] as const
export const DEFAULT_SHOW_DURATION_MINUTES = 90
export const MIN_SHOW_DURATION_MINUTES = 15
export const MAX_SHOW_DURATION_MINUTES = 600

export const TECH_REHEARSAL_DURATION_PRESETS = [30, 60, 90, 120, 150, 180] as const
export const DEFAULT_TECH_REHEARSAL_DURATION_MINUTES = 60

export function getVenueById(id: string): Venue | undefined {
  return VENUES.find((v) => v.id === id)
}

export function getVenueByName(name: string): Venue | undefined {
  return VENUES.find((v) => v.name === name)
}
