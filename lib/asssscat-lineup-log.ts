// Server-backed chronological log of ASSSSCAT lineups, shared across all
// signed-in users. Each entry records what cast performed (or is scheduled to
// perform) on a date.
//
// Storage history: previously stored in window.localStorage, which scoped the
// log to the device that created each entry. The log is now persisted via
// /api/asssscat/lineup-log so any signed-in user sees the same data.

export const MAX_LINEUP_ENTRIES = 2000

const LEGACY_STORAGE_KEY = 'ucb.asssscat.lineup-log'
const LEGACY_MIGRATED_KEY = 'ucb.asssscat.lineup-log.migrated'

export interface LineupPerformer {
  // ID of an AsssscatPerformer in the cast directory, when known.
  // Null when the name was imported/typed and not yet linked to a profile.
  performerId: string | null
  name: string
}

export interface LineupEntry {
  id: string
  showDate: string
  monologistName: string
  performers: LineupPerformer[]
  // Set once when the entry was first recorded, in ISO8601.
  createdAt: string
}

function isLineupPerformer(value: unknown): value is LineupPerformer {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    (v.performerId === null || typeof v.performerId === 'string') &&
    typeof v.name === 'string'
  )
}

export function isLineupEntry(value: unknown): value is LineupEntry {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.showDate === 'string' &&
    typeof v.monologistName === 'string' &&
    Array.isArray(v.performers) &&
    v.performers.every(isLineupPerformer) &&
    typeof v.createdAt === 'string'
  )
}

export function newLineupId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `lineup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function sortChronological(entries: LineupEntry[]): LineupEntry[] {
  // Most recent (and future) first.
  return [...entries].sort((a, b) => b.showDate.localeCompare(a.showDate))
}

async function fetchJson(input: RequestInfo, init?: RequestInit): Promise<unknown> {
  const res = await fetch(input, init)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

function readEntries(value: unknown): LineupEntry[] {
  if (!value || typeof value !== 'object') return []
  const arr = (value as { entries?: unknown }).entries
  if (!Array.isArray(arr)) return []
  return sortChronological(
    arr.filter(isLineupEntry).slice(0, MAX_LINEUP_ENTRIES),
  )
}

// Read any legacy localStorage entries left behind by the per-device version
// of this log. Returns null when the browser has no legacy data, or when the
// migration has already run.
function readLegacyLocalEntries(): LineupEntry[] | null {
  if (typeof window === 'undefined') return null
  try {
    if (window.localStorage.getItem(LEGACY_MIGRATED_KEY)) return null
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(LEGACY_MIGRATED_KEY, '1')
      return null
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return parsed.filter(isLineupEntry).slice(0, MAX_LINEUP_ENTRIES)
  } catch {
    return null
  }
}

function markLegacyMigrated(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LEGACY_MIGRATED_KEY, '1')
  } catch {
    // Quota / privacy — ignore.
  }
}

export async function loadLineupLog(): Promise<LineupEntry[]> {
  // Best-effort upload of any legacy local entries on first load. Once the
  // server has them, all signed-in users will see them.
  const legacy = readLegacyLocalEntries()
  if (legacy && legacy.length > 0) {
    try {
      await fetchJson('/api/asssscat/lineup-log/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: legacy }),
      })
      markLegacyMigrated()
    } catch {
      // Leave the legacy data in place so a future load can retry.
    }
  } else if (legacy && legacy.length === 0) {
    markLegacyMigrated()
  }

  try {
    const data = await fetchJson('/api/asssscat/lineup-log')
    return readEntries(data)
  } catch {
    return []
  }
}

export async function saveLineupEntry(entry: LineupEntry): Promise<LineupEntry[]> {
  try {
    const data = await fetchJson('/api/asssscat/lineup-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })
    return readEntries(data)
  } catch {
    return []
  }
}

export async function deleteLineupEntry(id: string): Promise<LineupEntry[]> {
  try {
    const data = await fetchJson(`/api/asssscat/lineup-log/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    return readEntries(data)
  } catch {
    return []
  }
}

// Record a lineup if no existing entry for the same date has the same set of
// performer names. Used after a successful send so re-sends don't double-log.
export async function recordLineupIfNew(entry: LineupEntry): Promise<LineupEntry[]> {
  try {
    const data = await fetchJson('/api/asssscat/lineup-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...entry, dedupe: true }),
    })
    return readEntries(data)
  } catch {
    return []
  }
}

// Count how many times each performer appears across lineup-log entries.
// Returns a map keyed by performer ID (only performers with linked IDs).
// Unlinked names are ignored — they show up in the log as raw names but
// can't be reliably attributed to a directory profile.
export function countLineupAppearancesById(
  entries: LineupEntry[],
): Map<string, number> {
  const counts = new Map<string, number>()
  for (const entry of entries) {
    for (const performer of entry.performers) {
      if (!performer.performerId) continue
      counts.set(performer.performerId, (counts.get(performer.performerId) ?? 0) + 1)
    }
  }
  return counts
}

// Lineup entries that include the given performer (matched by linked ID).
export function lineupEntriesForPerformer(
  entries: LineupEntry[],
  performerId: string,
): LineupEntry[] {
  return entries.filter((e) =>
    e.performers.some((p) => p.performerId === performerId),
  )
}

// Pure dedupe helper: would `entry` count as a duplicate of any item in
// `existing` for `recordLineupIfNew` purposes (same date, same monologist,
// same set of performer names)? Exposed for the server route and tests.
export function isDuplicateLineup(entry: LineupEntry, existing: LineupEntry[]): boolean {
  const sameDate = existing.filter((e) => e.showDate === entry.showDate)
  const newKey = entry.performers.map((p) => p.name.toLowerCase()).sort().join('|')
  return sameDate.some((e) => {
    const key = e.performers.map((p) => p.name.toLowerCase()).sort().join('|')
    return (
      key === newKey &&
      e.monologistName.toLowerCase() === entry.monologistName.toLowerCase()
    )
  })
}
