import type { ReactNode } from "react"
import { APP_NAME } from "@/lib/config"
import { UcbLogo } from "@/components/ucb-logo"
import { ThemeToggle } from "@/components/theme-toggle"

export type SiteHeaderProps = {
  toolName?: string
  authSlot?: ReactNode
}

export function SiteHeader({ toolName, authSlot }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 text-foreground border-b border-border/70 bg-background/80 backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-background/65 shadow-[0_1px_0_0_color-mix(in_oklch,var(--foreground)_5%,transparent)]">
      <div className="mx-auto max-w-6xl px-6 py-3.5 sm:py-4 flex items-center justify-between gap-6">
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
          <ThemeToggle />
          {authSlot}
        </div>
      </div>
    </header>
  )
}
