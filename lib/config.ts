/**
 * Centralized app configuration.
 * Add new venues or change defaults here instead of scattering magic strings.
 */

export const APP_NAME = "UCB Show Confirmation"
export const APP_TAGLINE = "Every show, confirmed in 300 clicks."

export interface Venue {
  id: string
  name: string
  label: string
}

export const VENUES: Venue[] = [
  { id: "franklin", name: "UCB Franklin", label: "Franklin" },
  { id: "annex", name: "UCB Annex", label: "Annex" },
] as const

export type VenueName = (typeof VENUES)[number]["name"]

export const DEFAULT_VENUE = VENUES[0].name as VenueName

export const DEFAULT_DIGITAL_PRICE = 10

export function getVenueById(id: string): Venue | undefined {
  return VENUES.find((v) => v.id === id)
}

export function getVenueByName(name: string): Venue | undefined {
  return VENUES.find((v) => v.name === name)
}
