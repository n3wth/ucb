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
              <div className="flex flex-col items-center gap-2.5">
                {/* Step circle */}
                <div
                  className={cn(
                    "relative h-9 w-9 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
                    done && "bg-primary text-primary-foreground",
                    active && "bg-primary text-primary-foreground shadow-md",
                    !done && !active && "bg-muted text-muted-foreground border border-border",
                  )}
                >
                  {/* Active ring */}
                  {active && (
                    <div 
                      className="absolute -inset-1 rounded-full ring-2 ring-primary/30" 
                      aria-hidden="true" 
                    />
                  )}
                  {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : idx + 1}
                </div>
                
                {/* Label */}
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-[0.15em] transition-colors duration-200",
                    (done || active) ? "text-foreground font-medium" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              
              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-3 mb-6">
                  <div
                    className={cn(
                      "h-px w-full rounded-full transition-colors duration-500",
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
