"use client"

import { useEffect, useState } from "react"
import { ToolPage } from "@/components/tool-page"
import { formatDate, formatTime } from "@/lib/format"
import type { AuditEntry } from "@/lib/audit"

interface AuditLogResponse {
  entries: AuditEntry[]
}

interface AuditLogAppProps {
  fetchEntries?: () => Promise<AuditLogResponse>
}

async function defaultFetchEntries(): Promise<AuditLogResponse> {
  const res = await fetch("/api/audit", { cache: "no-store" })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error || `Failed to load audit log (${res.status})`)
  }
  return (await res.json()) as AuditLogResponse
}

function splitTimestamp(iso: string): { date: string; time: string } {
  const [date, timePart] = iso.split("T")
  if (!timePart) return { date, time: "" }
  const [hh, mm] = timePart.split(":")
  return { date, time: `${hh}:${mm}` }
}

const ACTION_LABEL: Record<AuditEntry["action"], string> = {
  "confirm-show": "Confirm",
  "edit-show": "Edit",
  "cancel-show": "Cancel",
}

function EntryRow({ entry }: { entry: AuditEntry }) {
  const { date, time } = splitTimestamp(entry.timestamp)
  const dateLabel = date ? formatDate(date) : "—"
  const timeLabel = time ? formatTime(time) : ""
  const payloadJson = entry.payload ? JSON.stringify(entry.payload) : ""

  return (
    <li className="py-4">
      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {ACTION_LABEL[entry.action] ?? entry.action}
            <span className="text-muted-foreground font-normal"> · {entry.actor}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {dateLabel}
            {timeLabel ? ` · ${timeLabel}` : ""}
            {" · "}
            <span className="font-mono">{entry.targetId}</span>
          </p>
          {payloadJson && (
            <p className="mt-1 text-xs text-muted-foreground font-mono break-all">
              {payloadJson}
            </p>
          )}
        </div>
      </div>
    </li>
  )
}

export function AuditLogApp({ fetchEntries = defaultFetchEntries }: AuditLogAppProps = {}) {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchEntries()
      .then((res) => {
        if (!cancelled) setEntries(res.entries)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
    return () => {
      cancelled = true
    }
  }, [fetchEntries])

  return (
    <ToolPage
      title="Audit Log"
      description="Last 100 confirm, edit, and cancel actions. Producer emails shown as domain only."
    >
      {error ? (
        <div className="border border-destructive/40 bg-destructive/10 rounded-md p-4 text-sm text-destructive">
          {error}
        </div>
      ) : entries === null ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : entries.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg py-16 text-center">
          <p className="text-sm text-muted-foreground">No audit entries yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {entries.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </ToolPage>
  )
}
