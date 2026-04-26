"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { TOOLS, isPathUnderToolPath } from "@/lib/tools"
import { cn } from "@/lib/utils"

/**
 * Secondary navigation rendered under the SiteHeader on every /tools page.
 * Lists each available tool and highlights the active one so users can
 * switch between tools (e.g. Show Confirmation ↔ Show List) without
 * returning to the hub.
 */
export function ToolsNav() {
  const pathname = usePathname()

  const items = TOOLS.filter((t) => t.status === "available")

  return (
    <nav
      aria-label="Tools"
      className="border-b border-border/80 bg-gradient-to-b from-background/70 to-background/95"
    >
      <div className="app-shell">
        <ul className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto -mx-1 py-0.5 [scrollbar-width:thin]">
          {items.map((tool) => {
            const isActive = isPathUnderToolPath(pathname, tool.href)
            return (
              <li key={tool.id} className="shrink-0">
                <Link
                  href={tool.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center rounded-md px-3 py-2.5 text-[11px] sm:text-xs font-medium tracking-[0.16em] uppercase",
                    "transition-[color,background-color,border-color] duration-200",
                    "border-b-2 -mb-px",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive
                      ? "text-foreground border-foreground bg-foreground/[0.04] sm:bg-transparent"
                      : "text-foreground/55 border-transparent hover:text-foreground hover:bg-foreground/[0.03] hover:border-foreground/25",
                  )}
                >
                  {tool.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
