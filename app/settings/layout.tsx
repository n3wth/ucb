import type { ReactNode } from "react"
import Link from "next/link"
import { Home, Wrench } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SignOutButton } from "@/components/sign-out-button"
import { SiteFooter } from "@/components/site-footer"

/**
 * Layout for /settings. Mirrors the tools layout (header + footer) but
 * skips ToolsNav since settings sit alongside tools, not inside one.
 */
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <SiteHeader
        toolName="Settings"
        authSlot={
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="Home"
              className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-foreground/70 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Home</span>
            </Link>
            <Link
              href="/tools"
              aria-label="Tools"
              className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-foreground/70 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Tools</span>
            </Link>
            <SignOutButton />
          </div>
        }
      />
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14 flex-1 w-full">{children}</div>
      <SiteFooter />
    </main>
  )
}
