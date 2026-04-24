// Browser-local CRUD for recurring ASSSSCAT performers.
// Scoped to the current device/browser — the app has a single shared staff
// login, so there is no server-side user identity to key off.

import {
  ASSSSCAT_PERFORMER_CATEGORIES,
  type AsssscatPerformer,
  type AsssscatPerformerCategory,
} from "@/lib/types"

const STORAGE_KEY = "ucb.asssscat.performers"
export const MAX_PERFORMERS = 500
export const EMAIL_REGEX = /.+@.+\..+/

export function isValidEmail(raw: string): boolean {
  const v = raw.trim()
  return v.length > 0 && EMAIL_REGEX.test(v)
}

function isCategory(value: unknown): value is AsssscatPerformerCategory {
  return (
    typeof value === "string" &&
    (ASSSSCAT_PERFORMER_CATEGORIES as readonly string[]).includes(value)
  )
}

function isPerformer(value: unknown): value is AsssscatPerformer {
  if (typeof value !== "object" || value === null) return false
  const p = value as Record<string, unknown>
  return (
    typeof p.id === "string" &&
    p.id.length > 0 &&
    typeof p.name === "string" &&
    p.name.trim().length > 0 &&
    typeof p.email === "string" &&
    isValidEmail(p.email) &&
    isCategory(p.category)
  )
}

export function newPerformerId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function loadPerformers(): AsssscatPerformer[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const valid = parsed.filter(isPerformer).slice(0, MAX_PERFORMERS)
    return dedupePerformers(valid)
  } catch {
    return []
  }
}

export function savePerformers(list: AsssscatPerformer[]): AsssscatPerformer[] {
  const cleaned = dedupePerformers(list.filter(isPerformer)).slice(0, MAX_PERFORMERS)
  if (typeof window === "undefined") return cleaned
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
  } catch {
    // Quota or privacy mode — silently drop. In-memory state still works.
  }
  return cleaned
}

// De-duplicate by lowercased email, preserving first-seen entry.
export function dedupePerformers(list: AsssscatPerformer[]): AsssscatPerformer[] {
  const seen = new Set<string>()
  const out: AsssscatPerformer[] = []
  for (const p of list) {
    const key = p.email.trim().toLowerCase()
    if (!key) continue
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ ...p, name: p.name.trim(), email: p.email.trim() })
  }
  return out
}

export function addPerformer(
  list: AsssscatPerformer[],
  input: Omit<AsssscatPerformer, "id"> & { id?: string },
): AsssscatPerformer[] {
  const record: AsssscatPerformer = {
    id: input.id ?? newPerformerId(),
    name: input.name.trim(),
    email: input.email.trim(),
    category: input.category,
  }
  if (!isPerformer(record)) return list
  return dedupePerformers([...list.filter((p) => p.id !== record.id), record])
}

export function updatePerformer(
  list: AsssscatPerformer[],
  id: string,
  patch: Partial<Omit<AsssscatPerformer, "id">>,
): AsssscatPerformer[] {
  return list.map((p) => {
    if (p.id !== id) return p
    const next: AsssscatPerformer = {
      ...p,
      ...patch,
      id: p.id,
      name: (patch.name ?? p.name).trim(),
      email: (patch.email ?? p.email).trim(),
    }
    return isPerformer(next) ? next : p
  })
}

export function removePerformer(list: AsssscatPerformer[], id: string): AsssscatPerformer[] {
  return list.filter((p) => p.id !== id)
}

export interface NameMatchResult {
  input: string
  matched: AsssscatPerformer | null
}

export function parseCastInput(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

export function matchPerformersByName(
  inputs: string[],
  performers: AsssscatPerformer[],
): NameMatchResult[] {
  return inputs.map((input) => {
    const needle = input.toLowerCase()
    const exact = performers.find((p) => p.name.toLowerCase() === needle)
    if (exact) return { input, matched: exact }
    const partial = performers.find((p) => p.name.toLowerCase().includes(needle) || needle.includes(p.name.toLowerCase()))
    return { input, matched: partial ?? null }
  })
}

export function groupByCategory(
  list: AsssscatPerformer[],
): Record<AsssscatPerformerCategory, AsssscatPerformer[]> {
  const groups = Object.fromEntries(
    ASSSSCAT_PERFORMER_CATEGORIES.map((c) => [c, [] as AsssscatPerformer[]]),
  ) as Record<AsssscatPerformerCategory, AsssscatPerformer[]>
  for (const p of list) {
    groups[p.category].push(p)
  }
  for (const c of ASSSSCAT_PERFORMER_CATEGORIES) {
    groups[c].sort((a, b) => a.name.localeCompare(b.name))
  }
  return groups
}
