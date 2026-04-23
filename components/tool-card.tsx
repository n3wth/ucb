import Link from "next/link"
import { ArrowUpRight, Clock } from "lucide-react"
import type { Tool } from "@/lib/tools"
import { cn } from "@/lib/utils"

interface ToolCardProps {
  tool: Tool
  /** 1-indexed position used as a decorative numeric label */
  index?: number
}

export function ToolCard({ tool, index }: ToolCardProps) {
  const available = tool.status === "available"
  const Icon = tool.icon
  const indexLabel = typeof index === "number" ? String(index).padStart(2, "0") : undefined

  const content = (
    <article
      className={cn(
        "group relative h-full rounded-2xl border bg-card p-6 transition-all duration-200 ease-out",
        available
          ? "border-border hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-ambient-md cursor-pointer shadow-ambient-sm"
          : "border-dashed border-border/70 opacity-80",
      )}
    >
      {/* Top row: numeric index + status */}
      <div className="flex items-center justify-between">
        {indexLabel && (
          <span className="numeric-index text-[11px] text-muted-foreground/80">
            / {indexLabel}
          </span>
        )}
        {available ? (
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-foreground">
            <span className="status-dot" aria-hidden="true" />
            Live
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Clock className="h-2.5 w-2.5" aria-hidden="true" />
            Soon
          </span>
        )}
      </div>

      {/* Icon tile */}
      <div
        className={cn(
          "mt-6 h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
          available
            ? "bg-primary text-primary-foreground shadow-brand group-hover:scale-[1.03]"
            : "bg-muted text-muted-foreground border border-border",
        )}
        aria-hidden="true"
      >
        <Icon className="h-6 w-6" />
      </div>

      {/* Body */}
      <div className="mt-6 space-y-2">
        <div className="text-eyebrow">{tool.category}</div>
        <h3 className="font-display text-xl uppercase tracking-[-0.01em] text-foreground leading-tight text-balance">
          {tool.name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed pt-1 text-pretty">
          {tool.description}
        </p>
      </div>

      {/* Footer cue */}
      {available && (
        <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">Open tool</span>
          <span className="h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center group-hover:bg-primary group-hover:rotate-45 transition-all">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      )}
    </article>
  )

  if (!available) return content

  return (
    <Link
      href={tool.href}
      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {content}
    </Link>
  )
}
