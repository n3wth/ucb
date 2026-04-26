import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Tool } from "@/lib/tools"
import { cn } from "@/lib/utils"

interface ToolRowProps {
  tool: Tool
}

/**
 * Tool list row. Quiet, functional, scales for any number of tools.
 * Hover reveals the arrow; non-available tools render as static, muted rows.
 */
export function ToolRow({ tool }: ToolRowProps) {
  const Icon = tool.icon
  const available = tool.status === "available"

  const content = (
    <div className="flex items-start gap-4 py-4 sm:py-5 pl-0.5 sm:pl-1 pr-0.5">
      <div className="shrink-0 mt-0.5 rounded-md p-1.5 bg-foreground/[0.05] text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground tracking-tight">{tool.name}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>
      {available && (
        <ArrowRight
          className="h-4 w-4 text-foreground/80 shrink-0 mt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 motion-reduce:transition-none"
          aria-hidden="true"
        />
      )}
    </div>
  )

  if (!available) {
    return (
      <li className="opacity-50">
        <div className="px-1">{content}</div>
      </li>
    )
  }

  return (
    <li>
      <Link
        href={tool.href}
        className={cn(
          "group block rounded-lg transition-[background-color,transform,box-shadow] duration-200",
          "hover:bg-muted/35 hover:shadow-sm hover:-translate-y-px motion-reduce:hover:translate-y-0",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {content}
      </Link>
    </li>
  )
}
