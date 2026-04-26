"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

function formatTime(d: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).formatToParts(d)

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  const hour = get("hour").padStart(2, "0")
  const minute = get("minute")
  const tzName = get("timeZoneName")

  return `${hour}:${minute} ${tzName}`
}

function formatStamp(d: Date, nyOnly: boolean): string {
  if (nyOnly) return formatTime(d, "America/New_York")
  return `${formatTime(d, "America/New_York")} · ${formatTime(d, "America/Los_Angeles")}`
}

export function LiveTimestamp({ className, nyOnly = false }: { className?: string; nyOnly?: boolean }) {
  const [stamp, setStamp] = useState<string>("")

  useEffect(() => {
    const tick = () => setStamp(formatStamp(new Date(), nyOnly))
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [nyOnly])

  return (
    <span
      className={cn("tabular-nums", className)}
      suppressHydrationWarning
      aria-label="Current time"
    >
      {stamp || " "}
    </span>
  )
}
