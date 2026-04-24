"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { TOOLS } from "@/lib/tools"
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
      className="border-b border-foreground/20 bg-background"
    >
      <div className="mx-auto max-w-6xl px-6">
        <ul className="flex items-center gap-1 overflow-x-auto -mx-2">
          {items.map((tool) => {
            const isActive =
              pathname === tool.href || pathname.startsWith(tool.href + "/")
            return (
              <li key={tool.id} className="shrink-0">
                <Link
                  href={tool.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center px-3 py-2.5 text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase transition-colors border-b-2 -mb-px",
                    isActive
                      ? "text-foreground border-foreground"
                      : "text-foreground/60 border-transparent hover:text-foreground hover:border-foreground/40",
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
