import type { ReactNode } from "react"
import Link from "next/link"
import { APP_NAME } from "@/lib/config"
import { UcbLogo } from "@/components/ucb-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

export type SiteHeaderProps = {
  toolName?: string
  authSlot?: ReactNode
}

const brandLinkClass = cn(
  "flex items-center gap-2.5 sm:gap-3 min-w-0 max-w-full rounded-sm -m-1.5 p-1.5",
  "outline-none transition-[opacity,background-color] duration-150",
  "hover:bg-foreground/[0.04] active:bg-foreground/[0.06]",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
)

export function SiteHeader({ toolName, authSlot }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 text-foreground border-b border-border bg-background">
      <div className="app-shell h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center min-w-0 flex-1 gap-2 sm:gap-3">
          <Link
            href="/"
            className={brandLinkClass}
            aria-label={`${APP_NAME} — home`}
          >
            <UcbLogo size={28} showEyes={false} />
            <span className="font-display text-[0.9375rem] sm:text-base tracking-[0.01em] leading-none shrink-0 text-foreground">
              {APP_NAME}
            </span>
          </Link>
          {toolName && (
            <div className="flex items-center min-w-0 pl-2.5 sm:pl-3 border-l border-border self-stretch py-2">
              <span className="font-display text-[0.9375rem] sm:text-base tracking-[0.01em] leading-none text-muted-foreground truncate">
                {toolName}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          {authSlot}
        </div>
      </div>
    </header>
  )
}
