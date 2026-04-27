"use client"

import { useMemo, useState } from "react"
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import {
  countLineupAppearancesById,
  lineupEntriesForPerformer,
  type LineupEntry,
} from "@/lib/asssscat-lineup-log"
import type { AsssscatPerformer } from "@/lib/types"
import { X } from "lucide-react"

type ChartType = "bar" | "pie" | "line"
type FilterDimension = "none" | "gender" | "race" | "category"

interface AsssscatStatsProps {
  performers: AsssscatPerformer[]
  lineupEntries: LineupEntry[]
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

// Distinct colors for pie/bar segments
const SEGMENT_COLORS = [
  "hsl(var(--chart-1, 220 70% 50%))",
  "hsl(var(--chart-2, 160 60% 45%))",
  "hsl(var(--chart-3, 30 80% 55%))",
  "hsl(var(--chart-4, 280 65% 60%))",
  "hsl(var(--chart-5, 340 75% 55%))",
  "hsl(var(--chart-6, 200 70% 50%))",
  "hsl(var(--chart-7, 60 80% 45%))",
  "hsl(var(--chart-8, 120 50% 45%))",
]

// Build grouped appearance counts by a demographic dimension
function buildGroupedData(
  performers: AsssscatPerformer[],
  appearancesById: Map<string, number>,
  dimension: FilterDimension,
): { name: string; count: number }[] {
  if (dimension === "none") {
    return []
  }

  const groups = new Map<string, number>()

  for (const p of performers) {
    const count = appearancesById.get(p.id) ?? 0
    if (count === 0) continue

    let keys: string[] = []
    if (dimension === "gender") {
      keys = p.gender ? [p.gender] : ["Unknown"]
    } else if (dimension === "race") {
      keys = p.races && p.races.length > 0 ? p.races : ["Unknown"]
    } else if (dimension === "category") {
      keys = [p.category]
    }

    for (const key of keys) {
      groups.set(key, (groups.get(key) ?? 0) + count)
    }
  }

  return Array.from(groups.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

// Build time-series data: appearances per show date grouped by dimension
function buildTimeSeriesData(
  performers: AsssscatPerformer[],
  lineupEntries: LineupEntry[],
  dimension: FilterDimension,
): { date: string; [key: string]: string | number }[] {
  const performerById = new Map(performers.map((p) => [p.id, p]))

  // Collect all dimension keys first
  const allKeys = new Set<string>()
  for (const p of performers) {
    if (dimension === "gender") {
      allKeys.add(p.gender ?? "Unknown")
    } else if (dimension === "race") {
      if (p.races && p.races.length > 0) p.races.forEach((r) => allKeys.add(r))
      else allKeys.add("Unknown")
    } else if (dimension === "category") {
      allKeys.add(p.category)
    }
  }

  // Group entries by showDate
  const dateMap = new Map<string, Map<string, number>>()
  for (const entry of lineupEntries) {
    if (!entry.showDate) continue
    let dateCounts = dateMap.get(entry.showDate)
    if (!dateCounts) {
      dateCounts = new Map()
      dateMap.set(entry.showDate, dateCounts)
    }

    for (const lp of entry.performers) {
      if (!lp.performerId) continue
      const performer = performerById.get(lp.performerId)
      if (!performer) continue

      let keys: string[] = []
      if (dimension === "gender") {
        keys = [performer.gender ?? "Unknown"]
      } else if (dimension === "race") {
        keys = performer.races && performer.races.length > 0 ? performer.races : ["Unknown"]
      } else if (dimension === "category") {
        keys = [performer.category]
      } else {
        keys = ["count"]
      }

      for (const key of keys) {
        dateCounts.set(key, (dateCounts.get(key) ?? 0) + 1)
      }
    }
  }

  const sorted = Array.from(dateMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  )

  return sorted.map(([date, counts]) => {
    const row: { date: string; [key: string]: string | number } = { date }
    if (dimension === "none") {
      row.count = Array.from(counts.values()).reduce((s, v) => s + v, 0)
    } else {
      for (const key of allKeys) {
        row[key] = counts.get(key) ?? 0
      }
    }
    return row
  })
}

export function AsssscatStats({
  performers,
  lineupEntries,
  performerFilterId,
  onClearFilter,
}: AsssscatStatsProps) {
  const [chartType, setChartType] = useState<ChartType>("bar")
  const [filterDimension, setFilterDimension] = useState<FilterDimension>("none")

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

  const groupedData = useMemo(
    () => buildGroupedData(performers, appearancesById, filterDimension),
    [performers, appearancesById, filterDimension],
  )

  const timeSeriesData = useMemo(
    () => buildTimeSeriesData(performers, lineupEntries, filterDimension),
    [performers, lineupEntries, filterDimension],
  )

  // Series keys for line chart (all dimension values)
  const seriesKeys = useMemo(() => {
    if (filterDimension === "none") return ["count"]
    const keys = new Set<string>()
    for (const row of timeSeriesData) {
      for (const k of Object.keys(row)) {
        if (k !== "date") keys.add(k)
      }
    }
    return Array.from(keys)
  }, [filterDimension, timeSeriesData])

  const chartConfig = useMemo<ChartConfig>(() => {
    const keys = filterDimension === "none" ? ["count"] : groupedData.map((d) => d.name)
    return Object.fromEntries(
      keys.map((k, i) => [
        k,
        {
          label: k,
          color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
        },
      ]),
    )
  }, [filterDimension, groupedData])

  // Performer-scoped view — unchanged
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

  const hasData = ranked.length > 0
  const hasGroupedData = groupedData.length > 0
  const hasTimeSeriesData = timeSeriesData.length > 0

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

      {!hasData ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No appearances recorded yet. Send a booking from the Booking tab or
          add a historical lineup from the Lineup Log tab.
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1">Chart:</span>
              {(["bar", "pie", "line"] as ChartType[]).map((t) => (
                <Button
                  key={t}
                  type="button"
                  size="sm"
                  variant={chartType === t ? "default" : "outline"}
                  className="h-7 px-2.5 text-xs capitalize"
                  onClick={() => setChartType(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1">Group by:</span>
              {([
                ["none", "All"],
                ["gender", "Gender"],
                ["race", "Race"],
                ["category", "Category"],
              ] as [FilterDimension, string][]).map(([dim, label]) => (
                <Button
                  key={dim}
                  type="button"
                  size="sm"
                  variant={filterDimension === dim ? "default" : "outline"}
                  className="h-7 px-2.5 text-xs"
                  onClick={() => setFilterDimension(dim)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Chart */}
          {chartType === "bar" && (
            <div className="rounded-md border border-border p-4">
              {filterDimension === "none" ? (
                <ChartContainer config={{ count: { label: "Appearances", color: SEGMENT_COLORS[0] } }} className="h-[300px]">
                  <BarChart data={ranked.slice(0, 20).map((r) => ({ name: r.performer.name, count: r.count }))}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-35} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill={SEGMENT_COLORS[0]} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={groupedData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                      {groupedData.map((_entry, index) => (
                        <Cell key={index} fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </div>
          )}

          {chartType === "pie" && (
            <div className="rounded-md border border-border p-4">
              {filterDimension === "none" ? (
                <ChartContainer
                  config={Object.fromEntries(
                    ranked.slice(0, 10).map((r, i) => [
                      r.performer.name,
                      { label: r.performer.name, color: SEGMENT_COLORS[i % SEGMENT_COLORS.length] },
                    ]),
                  )}
                  className="h-[300px]"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie
                      data={ranked.slice(0, 10).map((r) => ({ name: r.performer.name, count: r.count }))}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {ranked.slice(0, 10).map((_r, i) => (
                        <Cell key={i} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : hasGroupedData ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                    <Pie
                      data={groupedData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                    >
                      {groupedData.map((_entry, index) => (
                        <Cell key={index} fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">No data for this grouping.</p>
              )}
            </div>
          )}

          {chartType === "line" && (
            <div className="rounded-md border border-border p-4">
              {hasTimeSeriesData ? (
                <ChartContainer
                  config={
                    filterDimension === "none"
                      ? { count: { label: "Appearances", color: SEGMENT_COLORS[0] } }
                      : chartConfig
                  }
                  className="h-[300px]"
                >
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {filterDimension === "none" ? (
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke={SEGMENT_COLORS[0]}
                        dot={false}
                        strokeWidth={2}
                      />
                    ) : (
                      seriesKeys.map((key, i) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                          dot={false}
                          strokeWidth={2}
                        />
                      ))
                    )}
                  </LineChart>
                </ChartContainer>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">No time-series data available.</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Table always shown below charts */}
      {hasData && (
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
