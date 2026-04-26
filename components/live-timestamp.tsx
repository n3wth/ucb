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

function formatStamp(d: Date): string {
  return `${formatTime(d, "America/New_York")} · ${formatTime(d, "America/Los_Angeles")}`
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
      {stamp || " "}
    </span>
  )
}
