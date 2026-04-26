"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function formatStamp(d: Date): string {
  // Format ET in the viewer's perspective using Intl. Force America/New_York
  // so the wordmark "EDT/EST" reflects venue time rather than viewer.
  const tzParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).formatToParts(d)

  const get = (type: string) =>
    tzParts.find((p) => p.type === type)?.value ?? ""

  const wd = get("weekday")
  const day = get("day")
  const mon = get("month")
  const hour = get("hour").padStart(2, "0")
  const minute = get("minute")
  const tz = get("timeZoneName")

  return `${wd} · ${day} ${mon} · ${hour}:${minute} ${tz}`
}

export function LiveTimestamp({ className }: { className?: string }) {
  const [stamp, setStamp] = useState<string>("")

  useEffect(() => {
    const tick = () => setStamp(formatStamp(new Date()))
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <span
      className={cn("tabular-nums", className)}
      suppressHydrationWarning
      aria-label="Current time"
    >
      {stamp || " "}
    </span>
  )
}
