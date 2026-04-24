import type { ReactNode } from "react"
import { APP_NAME } from "@/lib/config"
import { UcbLogo } from "@/components/ucb-logo"
import { ThemeToggle } from "@/components/theme-toggle"

export type SiteHeaderProps = {
  subStrip?: boolean
  toolName?: string
  authSlot?: ReactNode
}

export function SiteHeader({
  subStrip = false,
  toolName,
  authSlot,
}: SiteHeaderProps) {
  return (
    <header className="bg-background text-foreground border-b-2 border-foreground">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3 min-w-0">
          <UcbLogo size={28} showEyes={false} />
          <div className="flex items-baseline gap-2 leading-none min-w-0">
            <span className="font-display text-base tracking-[0.08em] uppercase shrink-0">
              {APP_NAME}
            </span>
            {toolName && (
              <>
                <span
                  className="font-display text-base tracking-[0.08em] uppercase text-foreground/40"
                  aria-hidden="true"
                >
                  /
                </span>
                <span className="font-display text-base tracking-[0.08em] uppercase text-foreground/80 truncate">
                  {toolName}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://ucbcomedy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline link-rainbow text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-foreground/60 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            ucbcomedy.com <span aria-hidden="true">↗</span>
          </a>
          <ThemeToggle />
          {authSlot}
        </div>
      </div>
      {subStrip && (
        <div className="border-t border-foreground/30">
          <div className="mx-auto max-w-6xl px-6 py-2 flex items-center justify-between gap-4 text-[10px] sm:text-xs tracking-[0.22em] uppercase text-foreground/70 font-medium">
            <span>Established MCMXCVI</span>
            <span>New York · Los Angeles</span>
          </div>
        </div>
      )}
    </header>
  )
}
