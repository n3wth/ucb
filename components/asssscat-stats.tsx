"use client"

import { useEffect, useMemo, useRef } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { AsssscatPerformer } from "@/lib/types"

interface AsssscatStatsProps {
  performers: AsssscatPerformer[]
  // Per-performer lineup appearance counts derived from the lineup log.
  // This is the source of truth for "appearances" and includes manually entered
  // historical lineups in addition to auto-recorded sends.
  lineupCounts: Map<string, number>
  // When set, the matching row is highlighted and scrolled into view.
  focusPerformerId?: string | null
  onFocusCleared?: () => void
}

export function AsssscatStats({
  performers,
  lineupCounts,
  focusPerformerId,
  onFocusCleared,
}: AsssscatStatsProps) {
  const ranked = useMemo(() => {
    return performers
      .map((p) => ({ performer: p, count: lineupCounts.get(p.id) ?? 0 }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [performers, lineupCounts])

  const totalAppearances = useMemo(
    () => ranked.reduce((sum, r) => sum + r.count, 0),
    [ranked],
  )

  const focusRef = useRef<HTMLTableRowElement | null>(null)

  useEffect(() => {
    if (!focusPerformerId) return
    focusRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    // Clear focus after the highlight has had time to register so a return
    // visit to the tab does not re-scroll.
    const t = window.setTimeout(() => onFocusCleared?.(), 2500)
    return () => window.clearTimeout(t)
  }, [focusPerformerId, onFocusCleared])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Statistics</h2>
        <p className="text-sm text-muted-foreground">
          Performers ranked by ASSSSCAT lineup appearances. Counts are derived from
          the Lineup Log — both manually entered historical shows and bookings
          recorded automatically when you send the cast email.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Performers booked" value={ranked.length.toString()} />
        <StatCard label="Total appearances" value={totalAppearances.toString()} />
        <StatCard
          label="Top count"
          value={ranked.length > 0 ? ranked[0].count.toString() : "—"}
        />
      </div>

      {ranked.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No appearances recorded yet. Add lineups in the Lineup Log tab or send
          a booking from the Booking tab to start building the leaderboard.
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Rank</TableHead>
                <TableHead>Performer</TableHead>
                <TableHead className="w-[140px]">Category</TableHead>
                <TableHead className="w-[120px] text-right">Appearances</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranked.map((r, i) => {
                const isFocused = r.performer.id === focusPerformerId
                return (
                  <TableRow
                    key={r.performer.id}
                    ref={isFocused ? focusRef : undefined}
                    className={cn(
                      "transition-colors",
                      isFocused && "bg-primary/10 outline outline-2 outline-primary/40",
                    )}
                  >
                    <TableCell className="font-mono text-muted-foreground">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-medium">{r.performer.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.performer.category}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{r.count}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  )
}
