import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { Tool } from "@/lib/tools"
import { cn } from "@/lib/utils"

interface ToolRowProps {
  tool: Tool
  /** 1-indexed position used as a decorative numeric label */
  index: number
}

/**
 * Editorial list row for the tools hub.
 * Typographic, asymmetric, no icon tiles, no SaaS "card" chrome.
 * Scales from 1 → N tools without looking padded or empty.
 */
export function ToolRow({ tool, index }: ToolRowProps) {
  const available = tool.status === "available"
  const indexLabel = String(index).padStart(2, "0")

  const inner = (
    <div className="grid grid-cols-12 gap-4 sm:gap-6 py-8 sm:py-10 items-start">
      {/* Numeric index — mono, muted, tabular */}
      <div className="col-span-2 sm:col-span-1 numeric-index text-xs text-muted-foreground pt-2">
        {indexLabel}
      </div>

      {/* Name + meta + description */}
      <div className="col-span-10 sm:col-span-8 space-y-3">
        <h3 className="font-display uppercase tracking-[-0.025em] leading-[0.95] text-3xl sm:text-4xl md:text-5xl text-foreground text-balance">
          {tool.name}
        </h3>
        <div className="flex items-center gap-3 flex-wrap text-[10px] uppercase tracking-[0.25em]">
          <span className="text-muted-foreground">{tool.category}</span>
          <span aria-hidden="true" className="h-px w-4 bg-border" />
          {available ? (
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <span className="status-dot" aria-hidden="true" />
              Live
            </span>
          ) : (
            <span className="text-muted-foreground">In development</span>
          )}
        </div>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl pt-1 text-pretty">
          {tool.description}
        </p>
      </div>

      {/* Right-edge affordance — desktop only */}
      <div className="hidden sm:flex col-span-3 justify-end pt-3">
        {available ? (
          <span
            className={cn(
              "inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground",
              "transition-transform group-hover:translate-x-1",
            )}
          >
            Open
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : (
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Soon
          </span>
        )}
      </div>
    </div>
  )

  if (!available) {
    return (
      <li className="border-b border-border opacity-60">
        <div className="px-2 sm:px-4">{inner}</div>
      </li>
    )
  }

  return (
    <li className="border-b border-border">
      <Link
        href={tool.href}
        className={cn(
          "group block px-2 sm:px-4 -mx-2 sm:-mx-4 rounded-md",
          "transition-colors hover:bg-foreground/[0.02]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {inner}
      </Link>
    </li>
  )
}
