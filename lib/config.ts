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

export function getVenueById(id: string): Venue | undefined {
  return VENUES.find((v) => v.id === id)
}

export function getVenueByName(name: string): Venue | undefined {
  return VENUES.find((v) => v.name === name)
}
