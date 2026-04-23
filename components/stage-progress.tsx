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
  { key: "result", label: "Done" },
]

export function StageProgress({ current }: StageProgressProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === current)

  return (
    <nav aria-label="Progress" className="w-full max-w-md">
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
                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
                    done && "bg-primary text-primary-foreground scale-100",
                    active && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !done && !active && "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                <span
                  className={cn(
                    "font-display text-[10px] uppercase tracking-widest transition-colors duration-200",
                    (done || active) ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "h-px flex-1 mx-4 rounded transition-colors duration-300",
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
