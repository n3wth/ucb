// Browser-local storage for the chronological log of ASSSSCAT lineups.
// Each entry records what cast performed (or is scheduled to perform) on a date.

const STORAGE_KEY = 'ucb.asssscat.lineup-log'
export const MAX_LINEUP_ENTRIES = 2000

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

function isLineupEntry(value: unknown): value is LineupEntry {
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

function sortChronological(entries: LineupEntry[]): LineupEntry[] {
  // Most recent (and future) first.
  return [...entries].sort((a, b) => b.showDate.localeCompare(a.showDate))
}

export function loadLineupLog(): LineupEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return sortChronological(parsed.filter(isLineupEntry).slice(0, MAX_LINEUP_ENTRIES))
  } catch {
    return []
  }
}

function persist(entries: LineupEntry[]): LineupEntry[] {
  const sorted = sortChronological(entries).slice(0, MAX_LINEUP_ENTRIES)
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted))
    } catch {
      // Quota / privacy — silently drop.
    }
  }
  return sorted
}

export function saveLineupEntry(entry: LineupEntry): LineupEntry[] {
  const current = loadLineupLog()
  const idx = current.findIndex((e) => e.id === entry.id)
  const next = idx >= 0
    ? current.map((e, i) => (i === idx ? entry : e))
    : [...current, entry]
  return persist(next)
}

export function deleteLineupEntry(id: string): LineupEntry[] {
  return persist(loadLineupLog().filter((e) => e.id !== id))
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

// Record a lineup if no existing entry for the same date has the same set of
// performer names. Used after a successful send so re-sends don't double-log.
export function recordLineupIfNew(entry: LineupEntry): LineupEntry[] {
  const current = loadLineupLog()
  const sameDate = current.filter((e) => e.showDate === entry.showDate)
  const newKey = entry.performers.map((p) => p.name.toLowerCase()).sort().join('|')
  const duplicate = sameDate.some((e) => {
    const key = e.performers.map((p) => p.name.toLowerCase()).sort().join('|')
    return key === newKey && e.monologistName.toLowerCase() === entry.monologistName.toLowerCase()
  })
  if (duplicate) return current
  return persist([...current, entry])
}
