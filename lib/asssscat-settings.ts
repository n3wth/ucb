// Browser-local overrides for ASSSSCAT email defaults and the
// show-confirmation closing signature. The site has a single shared
// staff login, so settings are scoped to the current device.

import {
  ASSSSCAT_ARRIVAL_TIME,
  ASSSSCAT_CALL_TIME,
  ASSSSCAT_COMPS_EMAIL,
  ASSSSCAT_CONTACT_PHONE,
  ASSSSCAT_SIGNATURE,
  ASSSSCAT_VENUE,
} from "@/lib/emails/asssscat"
import { SHOW_CONFIRMATION_DEFAULT_SIGNATURE } from "@/lib/emails/show-confirmation"

const STORAGE_KEY = "ucb.email-settings.v1"

export { SHOW_CONFIRMATION_DEFAULT_SIGNATURE }

export interface EmailSettings {
  asssscatCallTime: string
  asssscatArrivalTime: string
  asssscatContactPhone: string
  asssscatCompsEmail: string
  asssscatVenue: string
  asssscatSignature: string
  showConfirmationSignature: string
}

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  asssscatCallTime: ASSSSCAT_CALL_TIME,
  asssscatArrivalTime: ASSSSCAT_ARRIVAL_TIME,
  asssscatContactPhone: ASSSSCAT_CONTACT_PHONE,
  asssscatCompsEmail: ASSSSCAT_COMPS_EMAIL,
  asssscatVenue: ASSSSCAT_VENUE,
  asssscatSignature: ASSSSCAT_SIGNATURE,
  showConfirmationSignature: SHOW_CONFIRMATION_DEFAULT_SIGNATURE,
}

function sanitize(raw: unknown): EmailSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_EMAIL_SETTINGS }
  const partial = raw as Partial<Record<keyof EmailSettings, unknown>>
  const out: EmailSettings = { ...DEFAULT_EMAIL_SETTINGS }
  for (const key of Object.keys(DEFAULT_EMAIL_SETTINGS) as (keyof EmailSettings)[]) {
    const value = partial[key]
    if (typeof value === "string") {
      const trimmed = value.trim()
      if (trimmed) out[key] = trimmed
    }
  }
  return out
}

export function loadEmailSettings(): EmailSettings {
  if (typeof window === "undefined") return { ...DEFAULT_EMAIL_SETTINGS }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_EMAIL_SETTINGS }
    return sanitize(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_EMAIL_SETTINGS }
  }
}

export function saveEmailSettings(settings: EmailSettings): EmailSettings {
  const cleaned = sanitize(settings)
  if (typeof window === "undefined") return cleaned
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
  } catch {
    // Quota / privacy mode — silently drop. Settings still apply for the
    // current session via the in-memory state.
  }
  return cleaned
}

export function resetEmailSettings(): EmailSettings {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }
  return { ...DEFAULT_EMAIL_SETTINGS }
}
