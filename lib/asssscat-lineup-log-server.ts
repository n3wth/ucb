// Server-side store for ASSSSCAT lineup-log entries. Backed by Supabase when
// configured; falls back to an in-memory ring buffer (useful for local dev and
// tests). Mirrors the pattern used by `lib/audit.ts`.
//
// Each mutating method returns `{ entries, persisted }` so callers can tell
// whether the change actually hit shared storage. The migrate endpoint relies
// on this to refuse to "succeed" when data only landed in per-instance memory
// — otherwise clients would tombstone their local backup of legacy entries
// after a no-op migration and lose data permanently.

import {
  MAX_LINEUP_ENTRIES,
  isDuplicateLineup,
  isLineupEntry,
  sortChronological,
  type LineupEntry,
} from "@/lib/asssscat-lineup-log"
import { getSupabaseClient } from "@/lib/supabase"

const TABLE = "asssscat_lineup_log"

export interface LineupWriteResult {
  entries: LineupEntry[]
  persisted: boolean
}

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

  // Insert or update a lineup entry. Returns the latest list and whether the
  // write actually reached shared (DB) storage.
  async upsert(entry: LineupEntry): Promise<LineupWriteResult> {
    const persisted = await upsertInDb(entry)
    if (persisted) {
      const refreshed = await listFromDb()
      if (refreshed !== null) {
        memoryEntries = sortChronological(refreshed).slice(0, MAX_LINEUP_ENTRIES)
        return { entries: memoryEntries, persisted: true }
      }
    }
    const idx = memoryEntries.findIndex((e) => e.id === entry.id)
    const next =
      idx >= 0
        ? memoryEntries.map((e, i) => (i === idx ? entry : e))
        : [...memoryEntries, entry]
    return { entries: persistMemory(next), persisted: false }
  },

  // Insert only when no existing entry has the same date + monologist +
  // performer-name set.
  async recordIfNew(entry: LineupEntry): Promise<LineupWriteResult> {
    const current = await this.list()
    if (isDuplicateLineup(entry, current)) {
      // No-op write; treat as persisted iff the read came from the DB.
      const persisted = (await listFromDb()) !== null
      return { entries: current, persisted }
    }
    return this.upsert(entry)
  },

  async remove(id: string): Promise<LineupWriteResult> {
    const persisted = await deleteInDb(id)
    if (persisted) {
      const refreshed = await listFromDb()
      if (refreshed !== null) {
        memoryEntries = sortChronological(refreshed).slice(0, MAX_LINEUP_ENTRIES)
        return { entries: memoryEntries, persisted: true }
      }
    }
    return {
      entries: persistMemory(memoryEntries.filter((e) => e.id !== id)),
      persisted: false,
    }
  },

  // Bulk import — used to migrate legacy per-device entries into the shared
  // server store. Existing rows with the same id are left alone; duplicates
  // (same date + monologist + performer set) are dropped.
  //
  // `persisted` is true only if every accepted entry actually reached the DB
  // (or the import was a no-op against a DB-backed read). If even one write
  // fell back to memory, the result is reported as not persisted so the
  // caller can refuse to acknowledge the migration.
  async importMany(entries: LineupEntry[]): Promise<LineupWriteResult> {
    const current = await this.list()
    const existingIds = new Set(current.map((e) => e.id))
    let snapshot = current
    let persisted = (await listFromDb()) !== null
    for (const entry of entries) {
      if (existingIds.has(entry.id)) continue
      if (isDuplicateLineup(entry, snapshot)) continue
      const result = await this.upsert(entry)
      snapshot = result.entries
      if (!result.persisted) persisted = false
      existingIds.add(entry.id)
    }
    return { entries: snapshot, persisted }
  },

  // Test-only.
  _reset(): void {
    memoryEntries = []
  },
}
