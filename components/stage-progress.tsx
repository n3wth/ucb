"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Stage = "compose" | "preview" | "result"

interface StageProgressProps {
  current: Stage
}

const STEPS: { key: Stage; label: string }[] = [
  { key: "compose", label: "Details" },
  { key: "preview", label: "Review" },
  { key: "result", label: "Confirmed" },
]

export function StageProgress({ current }: StageProgressProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === current)

  return (
    <nav aria-label="Progress" className="w-full max-w-sm">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx
          const active = idx === currentIdx
          const isLast = idx === STEPS.length - 1

          return (
            <li key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                    (done || active) && "bg-primary text-primary-foreground",
                    !done && !active && "bg-muted text-muted-foreground border border-border",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : idx + 1}
                </div>

                <span
                  className={cn(
                    "text-xs transition-colors",
                    (done || active) ? "text-foreground font-medium" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div className="flex-1 mx-3 mb-5">
                  <div
                    className={cn(
                      "h-px w-full transition-colors",
                      idx < currentIdx ? "bg-primary" : "bg-border",
                    )}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
