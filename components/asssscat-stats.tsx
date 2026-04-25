"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  countLineupAppearancesById,
  lineupEntriesForPerformer,
  type LineupEntry,
} from "@/lib/asssscat-lineup-log"
import type { AsssscatPerformer } from "@/lib/types"
import { X } from "lucide-react"

interface AsssscatStatsProps {
  performers: AsssscatPerformer[]
  lineupEntries: LineupEntry[]
  // When set, the page is scoped to this performer's lineup appearances.
  performerFilterId?: string | null
  onClearFilter?: () => void
}

function formatShowDate(iso: string): string {
  if (!iso) return "—"
  const [y, m, d] = iso.split("-").map((s) => Number(s))
  if (!y || !m || !d) return iso
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function AsssscatStats({
  performers,
  lineupEntries,
  performerFilterId,
  onClearFilter,
}: AsssscatStatsProps) {
  const appearancesById = useMemo(
    () => countLineupAppearancesById(lineupEntries),
    [lineupEntries],
  )

  const filterPerformer = useMemo(
    () =>
      performerFilterId
        ? (performers.find((p) => p.id === performerFilterId) ?? null)
        : null,
    [performers, performerFilterId],
  )

  const ranked = useMemo(() => {
    return [...performers]
      .map((p) => ({ performer: p, count: appearancesById.get(p.id) ?? 0 }))
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [performers, appearancesById])

  const totalAppearances = useMemo(
    () => ranked.reduce((sum, row) => sum + row.count, 0),
    [ranked],
  )

  // Performer-scoped view: list this performer's lineup appearances.
  if (filterPerformer) {
    const filteredEntries = lineupEntriesForPerformer(lineupEntries, filterPerformer.id)
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              {filterPerformer.name} — Lineup Appearances
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredEntries.length === 0
                ? "No recorded lineup appearances yet."
                : `${filteredEntries.length} recorded ${filteredEntries.length === 1 ? "appearance" : "appearances"}.`}
            </p>
          </div>
          {onClearFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={onClearFilter}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear filter
            </Button>
          )}
        </div>

        {filteredEntries.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No lineup-log entries include {filterPerformer.name} yet.
          </div>
        ) : (
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Date</TableHead>
                  <TableHead className="w-[200px]">Monologist</TableHead>
                  <TableHead>Cast</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {formatShowDate(entry.showDate)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.monologistName || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {entry.performers.map((p, i) => (
                          <span
                            key={`${entry.id}-${i}`}
                            className={
                              p.performerId === filterPerformer.id
                                ? "inline-flex items-center rounded-full bg-primary/15 text-primary px-2 py-0.5 text-xs font-semibold"
                                : "inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs"
                            }
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Statistics</h2>
        <p className="text-sm text-muted-foreground">
          Performers ranked by recorded ASSSSCAT lineup appearances. Counts come
          from the lineup log — sent bookings auto-record, and you can manually
          add historical lineups from the Lineup Log tab.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Performers in lineups" value={ranked.length.toString()} />
        <StatCard label="Total appearances" value={totalAppearances.toString()} />
        <StatCard
          label="Top count"
          value={ranked.length > 0 ? ranked[0].count.toString() : "—"}
        />
      </div>

      {ranked.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No appearances recorded yet. Send a booking from the Booking tab or
          add a historical lineup from the Lineup Log tab.
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
              {ranked.map((row, i) => (
                <TableRow key={row.performer.id}>
                  <TableCell className="font-mono text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="font-medium">{row.performer.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.performer.category}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {row.count}
                  </TableCell>
                </TableRow>
              ))}
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
