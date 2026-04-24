// Browser-local preferences for default CC addresses on Show Confirmation.
// Scoped to the current device/browser — the app has a single shared staff
// login, so there is no server-side user identity to key off.

const STORAGE_KEY = "ucb.show-confirmation.default-cc"
export const MAX_DEFAULT_CC = 20
export const EMAIL_REGEX = /.+@.+\..+/

export function normalizeEmail(raw: string): string {
  return raw.trim()
}

export function isValidEmail(raw: string): boolean {
  const v = normalizeEmail(raw)
  return v.length > 0 && EMAIL_REGEX.test(v)
}

export function dedupeEmails(list: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of list) {
    const addr = normalizeEmail(raw)
    if (!addr) continue
    const key = addr.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(addr)
  }
  return out
}

export function loadDefaultCcEmails(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return dedupeEmails(parsed.filter((v): v is string => typeof v === "string" && isValidEmail(v))).slice(
      0,
      MAX_DEFAULT_CC,
    )
  } catch {
    return []
  }
}

export function saveDefaultCcEmails(list: string[]): string[] {
  const cleaned = dedupeEmails(list.filter(isValidEmail)).slice(0, MAX_DEFAULT_CC)
  if (typeof window === "undefined") return cleaned
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
  } catch {
    // Quota or privacy mode — silently drop. The in-memory state still works
    // for the current session.
  }
  return cleaned
}
