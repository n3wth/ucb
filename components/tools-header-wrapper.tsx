"use client"

import Link from "next/link"
import { Home, Settings } from "lucide-react"
import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SignOutButton } from "@/components/sign-out-button"
import { getActiveToolByPathname } from "@/lib/tools"
import { headerIconLinkClass } from "@/lib/site-chrome"

export function ToolsHeaderWrapper() {
  const pathname = usePathname()

  const tool = getActiveToolByPathname(pathname)

  return (
    <SiteHeader
      toolName={tool?.name}
      authSlot={
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Home"
            className={headerIconLinkClass}
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Home</span>
          </Link>
          <Link
            href="/settings"
            aria-label="Settings"
            className={headerIconLinkClass}
          >
            <Settings className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Settings</span>
          </Link>
          <SignOutButton />
        </div>
      }
    />
  )
}
