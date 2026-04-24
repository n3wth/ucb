// Browser-local per-show CC preferences for Show Confirmation.
// Keyed by normalised show title so that recurring shows (e.g. "Harold Night")
// automatically pre-populate their saved CC list when the title is typed.

import { dedupeEmails, isValidEmail } from "@/lib/cc-preferences"

const STORAGE_KEY = "ucb.show-confirmation.show-cc"
export const MAX_SHOW_CC = 20

/** Normalise a show title to a stable storage key. */
export function normalizeShowTitle(title: string): string {
  return title.trim().toLowerCase()
}

export interface ShowCcMap {
  [normalizedTitle: string]: string[]
}

function loadRaw(): ShowCcMap {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {}
    const out: ShowCcMap = {}
    for (const [key, val] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof key !== "string") continue
      if (!Array.isArray(val)) continue
      const emails = dedupeEmails(
        val.filter((v): v is string => typeof v === "string" && isValidEmail(v)),
      ).slice(0, MAX_SHOW_CC)
      if (emails.length > 0) out[key] = emails
    }
    return out
  } catch {
    return {}
  }
}

function saveRaw(map: ShowCcMap): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // Quota / privacy mode — silently drop.
  }
}

/** Load the full per-show CC map. */
export function loadShowCcMap(): ShowCcMap {
  return loadRaw()
}

/** Load CC emails saved for a specific show title. Returns [] if none. */
export function loadShowCcEmails(showTitle: string): string[] {
  const key = normalizeShowTitle(showTitle)
  if (!key) return []
  return loadRaw()[key] ?? []
}

/** Save CC emails for a show title, replacing any existing entry. */
export function saveShowCcEmails(showTitle: string, emails: string[]): string[] {
  const key = normalizeShowTitle(showTitle)
  if (!key) return emails
  const cleaned = dedupeEmails(emails.filter(isValidEmail)).slice(0, MAX_SHOW_CC)
  const map = loadRaw()
  if (cleaned.length === 0) {
    delete map[key]
  } else {
    map[key] = cleaned
  }
  saveRaw(map)
  return cleaned
}

/** Delete all saved CC emails for a show title. */
export function deleteShowCcEmails(showTitle: string): void {
  const key = normalizeShowTitle(showTitle)
  if (!key) return
  const map = loadRaw()
  delete map[key]
  saveRaw(map)
}

/** Return all show titles that have saved CC preferences, in sorted order. */
export function listSavedShowTitles(): string[] {
  return Object.keys(loadRaw()).sort()
}
