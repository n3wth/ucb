import { getSupabaseClient } from "@/lib/supabase"

export type AuditAction =
  | "confirm-show"
  | "edit-show"
  | "cancel-show"

export interface AuditEntry {
  id: string
  timestamp: string // ISO-8601
  actor: string // email or best-effort identifier; domain-only for producer emails
  action: AuditAction
  targetId: string
  payload?: Record<string, unknown>
}

const MAX_ENTRIES = 100

// Ring buffer: newest entry at index 0. Used as a write-through cache and
// fallback when Supabase is unavailable.
const entries: AuditEntry[] = []

// Best-effort email redaction. Keep the domain so admins can tell staff apart
// from external producers, but drop the local-part to avoid leaking a producer
// address every time it appears in an audit row.
export function redactEmail(email: string): string {
  const at = email.indexOf("@")
  if (at <= 0) return email
  return `*@${email.slice(at + 1)}`
}

// Shallow copy with any value that looks like a producer email redacted to
// domain-only. Recurses one level into objects/arrays — payloads are small.
function redactPayload(value: unknown): unknown {
  if (typeof value === "string") {
    return value.includes("@") ? redactEmail(value) : value
  }
  if (Array.isArray(value)) return value.map(redactPayload)
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = redactPayload(v)
    }
    return out
  }
  return value
}

function newId(): string {
  // crypto.randomUUID is available in Node 18+ and the edge runtime.
  return crypto.randomUUID()
}

async function persistToDb(entry: AuditEntry): Promise<void> {
  const client = getSupabaseClient()
  if (!client) return
  try {
    await client.from("audit_log").insert({
      id: entry.id,
      timestamp: entry.timestamp,
      actor: entry.actor,
      action: entry.action,
      target_id: entry.targetId,
      payload: entry.payload ?? null,
    })
  } catch {
    // Best-effort — in-memory entry already recorded
  }
}

async function listFromDb(limit: number): Promise<AuditEntry[] | null> {
  const client = getSupabaseClient()
  if (!client) return null
  try {
    const { data, error } = await client
      .from("audit_log")
      .select("id, timestamp, actor, action, target_id, payload")
      .order("timestamp", { ascending: false })
      .limit(limit)
    if (error || !data) return null
    return data.map((row) => ({
      id: row.id as string,
      timestamp: row.timestamp as string,
      actor: row.actor as string,
      action: row.action as AuditAction,
      targetId: row.target_id as string,
      payload: row.payload as Record<string, unknown> | undefined,
    }))
  } catch {
    return null
  }
}

export const audit = {
  log(
    actorEmail: string,
    action: AuditAction,
    targetId: string,
    payload?: Record<string, unknown>,
  ): AuditEntry {
    const entry: AuditEntry = {
      id: newId(),
      timestamp: new Date().toISOString(),
      actor: actorEmail || "unknown",
      action,
      targetId,
      payload: payload
        ? (redactPayload(payload) as Record<string, unknown>)
        : undefined,
    }
    entries.unshift(entry)
    if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES
    // Fire-and-forget: don't block the caller on DB I/O
    persistToDb(entry).catch(() => {})
    return entry
  },

  async listAsync(limit: number = MAX_ENTRIES): Promise<AuditEntry[]> {
    const capped = Math.max(0, Math.min(limit, MAX_ENTRIES))
    const dbRows = await listFromDb(capped)
    if (dbRows !== null) return dbRows
    return entries.slice(0, capped)
  },

  // Synchronous path for callers that can't await. Returns in-memory only.
  list(limit: number = MAX_ENTRIES): AuditEntry[] {
    return entries.slice(0, Math.max(0, Math.min(limit, MAX_ENTRIES)))
  },

  // Test-only. Clears the ring buffer.
  _reset(): void {
    entries.length = 0
  },
}

export const AUDIT_MAX_ENTRIES = MAX_ENTRIES
