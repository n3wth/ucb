import Link from "next/link"
import { ArrowUpRight, Clock } from "lucide-react"
import type { Tool } from "@/lib/tools"
import { cn } from "@/lib/utils"

export function ToolCard({ tool }: { tool: Tool }) {
  const available = tool.status === "available"
  const Icon = tool.icon

  const content = (
    <div
      className={cn(
        "group relative h-full rounded-xl border bg-card p-6 transition-all",
        available
          ? "border-border hover:border-primary/60 hover:shadow-md cursor-pointer"
          : "border-border/60 opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
          <Icon className="h-5 w-5" />
        </div>
        {available ? (
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded-full px-2 py-0.5">
            <Clock className="h-2.5 w-2.5" />
            Soon
          </span>
        )}
      </div>
      <div className="mt-5 space-y-1.5">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {tool.category}
        </div>
        <h3 className="font-display text-base uppercase tracking-wide text-foreground">
          {tool.name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed pt-1">
          {tool.description}
        </p>
      </div>
    </div>
  )

  if (!available) return content

  return (
    <Link href={tool.href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
      {content}
    </Link>
  )
}
