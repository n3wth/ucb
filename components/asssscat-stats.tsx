"use client"

import { useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AsssscatPerformer } from "@/lib/types"

interface AsssscatStatsProps {
  performers: AsssscatPerformer[]
}

export function AsssscatStats({ performers }: AsssscatStatsProps) {
  const ranked = useMemo(() => {
    return [...performers]
      .filter((p) => (p.bookingCount ?? 0) > 0)
      .sort((a, b) => (b.bookingCount ?? 0) - (a.bookingCount ?? 0))
  }, [performers])

  const totalAppearances = useMemo(
    () => ranked.reduce((sum, p) => sum + (p.bookingCount ?? 0), 0),
    [ranked],
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Statistics</h2>
        <p className="text-sm text-muted-foreground">
          Performers ranked by recorded ASSSSCAT appearances. Counts increment
          automatically when you send a booking.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Performers booked" value={ranked.length.toString()} />
        <StatCard label="Total appearances" value={totalAppearances.toString()} />
        <StatCard
          label="Top count"
          value={ranked.length > 0 ? (ranked[0].bookingCount ?? 0).toString() : "—"}
        />
      </div>

      {ranked.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No appearances recorded yet. Send a booking from the Booking tab to start
          building the leaderboard.
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
              {ranked.map((p, i) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.category}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {p.bookingCount ?? 0}
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
