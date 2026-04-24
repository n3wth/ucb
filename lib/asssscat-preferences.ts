// Browser-local preferences for the ASSSSCAT tool.
// Mirrors the cc-preferences pattern used by Show Confirmation.

import { dedupeEmails, isValidEmail } from "@/lib/cc-preferences"

const DEFAULT_CC_KEY = "ucb.asssscat.default-cc"
export const MAX_DEFAULT_CC = 20

export function loadAsssscatDefaultCc(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(DEFAULT_CC_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return dedupeEmails(
      parsed.filter((v): v is string => typeof v === "string" && isValidEmail(v)),
    ).slice(0, MAX_DEFAULT_CC)
  } catch {
    return []
  }
}

export function saveAsssscatDefaultCc(list: string[]): string[] {
  const cleaned = dedupeEmails(list.filter(isValidEmail)).slice(0, MAX_DEFAULT_CC)
  if (typeof window === "undefined") return cleaned
  try {
    window.localStorage.setItem(DEFAULT_CC_KEY, JSON.stringify(cleaned))
  } catch {
    // Quota / privacy — silently drop.
  }
  return cleaned
}
