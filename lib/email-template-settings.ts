// Browser-local overrides for email-template defaults.
// Mirrors the cc-preferences pattern: localStorage on a single shared device,
// since the portal has one shared staff login.
//
// Only fields that affect the rendered body/subject are user-editable here.
// Server-side constants (TO recipient, venue) stay hardcoded in lib/emails.

import {
  ASSSSCAT_ARRIVAL_TIME,
  ASSSSCAT_CALL_TIME,
  ASSSSCAT_COMPS_EMAIL,
  ASSSSCAT_CONTACT_PHONE,
  ASSSSCAT_SIGNATURE,
} from "@/lib/emails"

const STORAGE_KEY = "ucb.email-template-settings"

export interface AsssscatTemplateSettings {
  callTime: string
  arrivalTime: string
  contactPhone: string
  compsEmail: string
  signature: string
}

export interface EmailTemplateSettings {
  asssscat: AsssscatTemplateSettings
}

export const ASSSSCAT_DEFAULTS: AsssscatTemplateSettings = {
  callTime: ASSSSCAT_CALL_TIME,
  arrivalTime: ASSSSCAT_ARRIVAL_TIME,
  contactPhone: ASSSSCAT_CONTACT_PHONE,
  compsEmail: ASSSSCAT_COMPS_EMAIL,
  signature: ASSSSCAT_SIGNATURE,
}

export const DEFAULTS: EmailTemplateSettings = {
  asssscat: ASSSSCAT_DEFAULTS,
}

// Field-level metadata drives the settings UI.
export interface SettingField<K extends string> {
  key: K
  label: string
  hint?: string
  multiline?: boolean
}

export const ASSSSCAT_FIELDS: SettingField<keyof AsssscatTemplateSettings>[] = [
  { key: "callTime", label: "Call time", hint: "Shown in the opening line. Example: 8:30PM." },
  { key: "arrivalTime", label: "Arrival time", hint: "Latest arrival the cast should aim for." },
  { key: "contactPhone", label: "Contact phone", hint: "Number cast can text if running late." },
  { key: "compsEmail", label: "Comps email", hint: "Address performers email for comps." },
  { key: "signature", label: "Signature", hint: "Closes the email. Currently not rendered, kept here for future use." },
]

function isString(v: unknown): v is string {
  return typeof v === "string"
}

function mergeAsssscat(raw: unknown): AsssscatTemplateSettings {
  const out = { ...ASSSSCAT_DEFAULTS }
  if (!raw || typeof raw !== "object") return out
  const r = raw as Record<string, unknown>
  for (const field of ASSSSCAT_FIELDS) {
    const v = r[field.key]
    if (isString(v) && v.trim().length > 0) {
      out[field.key] = v
    }
  }
  return out
}

export function loadEmailTemplateSettings(): EmailTemplateSettings {
  if (typeof window === "undefined") return DEFAULTS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return DEFAULTS
    const obj = parsed as Record<string, unknown>
    return {
      asssscat: mergeAsssscat(obj.asssscat),
    }
  } catch {
    return DEFAULTS
  }
}

export function saveEmailTemplateSettings(next: EmailTemplateSettings): EmailTemplateSettings {
  const cleaned: EmailTemplateSettings = {
    asssscat: mergeAsssscat(next.asssscat),
  }
  if (typeof window === "undefined") return cleaned
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
  } catch {
    // Quota or privacy mode — silently drop.
  }
  return cleaned
}

export function resetEmailTemplateSettings(): EmailTemplateSettings {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }
  return DEFAULTS
}
