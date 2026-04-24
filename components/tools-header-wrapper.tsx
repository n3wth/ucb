"use client"

import Link from "next/link"
import { Home } from "lucide-react"
import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SignOutButton } from "@/components/sign-out-button"
import { TOOLS } from "@/lib/tools"

export function ToolsHeaderWrapper() {
  const pathname = usePathname()

  const tool = TOOLS.filter(
    (t) => pathname === t.href || pathname.startsWith(t.href + "/"),
  ).sort((a, b) => b.href.length - a.href.length)[0]

  return (
    <SiteHeader
      toolName={tool?.name}
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
          <SignOutButton />
        </div>
      }
    />
  )
}
