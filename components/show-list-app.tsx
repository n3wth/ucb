"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { ToolPage } from "@/components/tool-page"
import { formatDate, formatTime, splitIsoDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ShowListItem, ShowListResponse } from "@/lib/types"

type Filter = "upcoming" | "past" | "all"

const FILTERS: { value: Filter; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "all", label: "All" },
]

interface ShowListAppProps {
  fetchShows?: () => Promise<ShowListResponse>
  now?: Date
}

async function defaultFetchShows(): Promise<ShowListResponse> {
  const res = await fetch("/api/shows/list", { cache: "no-store" })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error || `Failed to load shows (${res.status})`)
  }
  return (await res.json()) as ShowListResponse
}

function ShowRow({ show }: { show: ShowListItem }) {
  const { date, time } = splitIsoDateTime(show.startISO)
  const dateLabel = date ? formatDate(date) : "—"
  const timeLabel = time ? formatTime(time) : ""

  return (
    <li className="py-4 px-1 -mx-1 rounded-sm transition-colors hover:bg-muted/25">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-foreground truncate">
            {show.title || "(untitled)"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {dateLabel}
            {timeLabel ? ` · ${timeLabel}` : ""}
            {show.venue ? ` · ${show.venue}` : ""}
          </p>
          {show.producer && (
            <p className="mt-0.5 text-xs text-muted-foreground">Producer: {show.producer}</p>
          )}
        </div>
        {show.link && (
          <Link
            href={show.link}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Calendar
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </li>
  )
}

export function ShowListApp({ fetchShows = defaultFetchShows, now }: ShowListAppProps) {
  const [filter, setFilter] = useState<Filter>("upcoming")
  const [shows, setShows] = useState<ShowListItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchShows()
      .then((data) => {
        if (!cancelled) setShows(data.shows)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load shows")
      })
    return () => {
      cancelled = true
    }
  }, [fetchShows])

  const filtered = useMemo(() => {
    if (!shows) return []
    const reference = (now ?? new Date()).getTime()
    const sorted = [...shows].sort(
      (a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime(),
    )
    if (filter === "all") return sorted
    return sorted.filter((s) => {
      const t = new Date(s.startISO).getTime()
      return filter === "upcoming" ? t >= reference : t < reference
    })
  }, [shows, filter, now])

  const isLoading = shows === null && !error

  return (
    <ToolPage
      title="Show list"
      description="Upcoming confirmed shows from the UCB calendar."
    >
      <div
        role="tablist"
        aria-label="Filter shows"
        className="mb-6 inline-flex items-center gap-1 rounded-md border border-border p-1"
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1 text-xs rounded-sm transition-colors",
              filter === f.value
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="border border-destructive/40 bg-destructive/5 rounded-md px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {!error && isLoading && (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading shows…</div>
      )}

      {!error && !isLoading && filtered.length === 0 && (
        <div className="border border-dashed border-border rounded-lg py-16 text-center">
          <p className="text-sm text-muted-foreground">No shows to display.</p>
        </div>
      )}

      {!error && !isLoading && filtered.length > 0 && (
        <ul className="divide-y divide-border border-y border-border">
          {filtered.map((show) => (
            <ShowRow key={show.id} show={show} />
          ))}
        </ul>
      )}
    </ToolPage>
  )
}
