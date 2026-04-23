"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Stage = "compose" | "preview" | "result"

interface StageProgressProps {
  current: Stage
}

const STEPS: { key: Stage; label: string }[] = [
  { key: "compose", label: "Details" },
  { key: "preview", label: "Preview" },
  { key: "result", label: "Confirmed" },
]

export function StageProgress({ current }: StageProgressProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === current)

  return (
    <nav aria-label="Progress" className="w-full max-w-2xl">
      <ol className="flex items-center gap-2">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx
          const active = idx === currentIdx
          return (
            <li key={step.key} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 border",
                    done && "bg-primary text-primary-foreground border-primary",
                    active && "bg-primary text-primary-foreground border-primary",
                    !done && !active && "bg-muted text-muted-foreground border-border",
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium truncate",
                    (done || active) ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 rounded",
                    idx < currentIdx ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
