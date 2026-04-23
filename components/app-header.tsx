"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { UcbLogo } from "@/components/ucb-logo"
import { Button } from "@/components/ui/button"
import { LogOut, ChevronLeft } from "lucide-react"
import { APP_NAME } from "@/lib/config"

interface AppHeaderProps {
  showSignOut?: boolean
  /** When provided, shows "{APP_NAME} / {toolName}" breadcrumb and a back link to /tools */
  toolName?: string
}

export function AppHeader({ showSignOut = true, toolName }: AppHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  return (
    <header className="bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link
          href="/tools"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md -m-1 p-1"
        >
          <UcbLogo size={32} showEyes={false} className="invert" />
          <div className="flex items-baseline gap-2 leading-none min-w-0">
            <span className="font-display text-base uppercase tracking-wide text-sidebar-foreground shrink-0">
              {APP_NAME}
            </span>
            {toolName && (
              <>
                <span className="text-sidebar-foreground/30 font-display text-sm" aria-hidden="true">
                  /
                </span>
                <span className="text-sm text-sidebar-foreground/80 truncate">{toolName}</span>
              </>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {toolName && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:inline-flex text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Link href="/tools">
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                All tools
              </Link>
            </Button>
          )}
          {showSignOut && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Sign out
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
