"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, ChevronLeft } from "lucide-react"
import { UcbLogo } from "@/components/ucb-logo"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/lib/config"
import { TOOLS } from "@/lib/tools"

/**
 * The one and only site header.
 * - Always the dark UCB bar (matches ucbcomedy.com).
 * - Auto-detects whether we're on a public page or inside /tools/*.
 * - When on a tool page, shows the breadcrumb + "All tools" + "Sign out".
 * - On public pages, shows just "Sign in" (except on /login itself).
 */
export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()

  const isTools = pathname.startsWith("/tools")
  const tool = TOOLS.filter(
    (t) => pathname === t.href || pathname.startsWith(t.href + "/"),
  ).sort((a, b) => b.href.length - a.href.length)[0]

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  return (
    <header className="bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link
          href={isTools ? "/tools" : "/"}
          className="flex items-center gap-3 rounded-md -m-1 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <UcbLogo size={32} showEyes={false} className="invert" />
          <div className="flex items-baseline gap-2 leading-none min-w-0">
            <span className="text-sm font-semibold text-sidebar-foreground shrink-0">
              {APP_NAME}
            </span>
            {tool && (
              <>
                <span className="text-sidebar-foreground/40 text-sm" aria-hidden="true">
                  /
                </span>
                <span className="text-sm text-sidebar-foreground/80 truncate">
                  {tool.name}
                </span>
              </>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {isTools ? (
            <>
              {tool && (
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Sign out
              </Button>
            </>
          ) : (
            pathname !== "/login" && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  )
}
