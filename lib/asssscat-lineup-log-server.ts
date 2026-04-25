// Server-side store for ASSSSCAT lineup-log entries. Backed by Supabase when
// configured; falls back to an in-memory ring buffer (useful for local dev and
// tests). Mirrors the pattern used by `lib/audit.ts`.

import {
  MAX_LINEUP_ENTRIES,
  isDuplicateLineup,
  isLineupEntry,
  sortChronological,
  type LineupEntry,
} from "@/lib/asssscat-lineup-log"
import { getSupabaseClient } from "@/lib/supabase"

const TABLE = "asssscat_lineup_log"

// Newest-by-show-date first. Used as a write-through cache and a fallback
// when Supabase is not configured.
let memoryEntries: LineupEntry[] = []

function rowToEntry(row: Record<string, unknown>): LineupEntry | null {
  const candidate = {
    id: row.id,
    showDate: row.show_date,
    monologistName: row.monologist_name,
    performers: row.performers,
    createdAt:
      typeof row.created_at === "string"
        ? row.created_at
        : new Date().toISOString(),
  }
  return isLineupEntry(candidate) ? candidate : null
}

function entryToRow(entry: LineupEntry): Record<string, unknown> {
  return {
    id: entry.id,
    show_date: entry.showDate,
    monologist_name: entry.monologistName,
    performers: entry.performers,
    created_at: entry.createdAt,
    updated_at: new Date().toISOString(),
  }
}

async function listFromDb(): Promise<LineupEntry[] | null> {
  const client = getSupabaseClient()
  if (!client) return null
  try {
    const { data, error } = await client
      .from(TABLE)
      .select("id, show_date, monologist_name, performers, created_at")
      .order("show_date", { ascending: false })
      .limit(MAX_LINEUP_ENTRIES)
    if (error || !data) return null
    return data
      .map((row) => rowToEntry(row as Record<string, unknown>))
      .filter((e): e is LineupEntry => e !== null)
  } catch {
    return null
  }
}

async function upsertInDb(entry: LineupEntry): Promise<boolean> {
  const client = getSupabaseClient()
  if (!client) return false
  try {
    const { error } = await client.from(TABLE).upsert(entryToRow(entry), {
      onConflict: "id",
    })
    return !error
  } catch {
    return false
  }
}

async function deleteInDb(id: string): Promise<boolean> {
  const client = getSupabaseClient()
  if (!client) return false
  try {
    const { error } = await client.from(TABLE).delete().eq("id", id)
    return !error
  } catch {
    return false
  }
}

function persistMemory(entries: LineupEntry[]): LineupEntry[] {
  memoryEntries = sortChronological(entries).slice(0, MAX_LINEUP_ENTRIES)
  return memoryEntries
}

export const lineupLogStore = {
  async list(): Promise<LineupEntry[]> {
    const fromDb = await listFromDb()
    if (fromDb !== null) {
      memoryEntries = sortChronological(fromDb).slice(0, MAX_LINEUP_ENTRIES)
      return memoryEntries
    }
    return memoryEntries.slice()
  },

  // Insert or update a lineup entry. Returns the latest list.
  async upsert(entry: LineupEntry): Promise<LineupEntry[]> {
    const ok = await upsertInDb(entry)
    if (ok) {
      const refreshed = await listFromDb()
      if (refreshed !== null) {
        memoryEntries = sortChronological(refreshed).slice(0, MAX_LINEUP_ENTRIES)
        return memoryEntries
      }
    }
    const idx = memoryEntries.findIndex((e) => e.id === entry.id)
    const next =
      idx >= 0
        ? memoryEntries.map((e, i) => (i === idx ? entry : e))
        : [...memoryEntries, entry]
    return persistMemory(next)
  },

  // Insert only when no existing entry has the same date + monologist +
  // performer-name set. Returns the latest list.
  async recordIfNew(entry: LineupEntry): Promise<LineupEntry[]> {
    const current = await this.list()
    if (isDuplicateLineup(entry, current)) return current
    return this.upsert(entry)
  },

  async remove(id: string): Promise<LineupEntry[]> {
    const ok = await deleteInDb(id)
    if (ok) {
      const refreshed = await listFromDb()
      if (refreshed !== null) {
        memoryEntries = sortChronological(refreshed).slice(0, MAX_LINEUP_ENTRIES)
        return memoryEntries
      }
    }
    return persistMemory(memoryEntries.filter((e) => e.id !== id))
  },

  // Bulk import — used to migrate legacy per-device entries into the shared
  // server store. Existing rows with the same id are left alone; duplicates
  // (same date + monologist + performer set) are dropped.
  async importMany(entries: LineupEntry[]): Promise<LineupEntry[]> {
    const current = await this.list()
    const existingIds = new Set(current.map((e) => e.id))
    let snapshot = current
    for (const entry of entries) {
      if (existingIds.has(entry.id)) continue
      if (isDuplicateLineup(entry, snapshot)) continue
      snapshot = await this.upsert(entry)
      existingIds.add(entry.id)
    }
    return snapshot
  },

  // Test-only.
  _reset(): void {
    memoryEntries = []
  },
}
