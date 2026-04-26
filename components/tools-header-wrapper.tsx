"use client"

import Link from "next/link"
import { Settings } from "lucide-react"
import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SignOutButton } from "@/components/sign-out-button"
import { getActiveToolByPathname } from "@/lib/tools"

const iconBtnClass =
  "inline-flex items-center justify-center h-8 w-8 rounded-sm text-foreground/60 hover:text-foreground hover:bg-foreground/[0.05] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export function ToolsHeaderWrapper() {
  const pathname = usePathname()

  const tool = getActiveToolByPathname(pathname)

  return (
    <SiteHeader
      toolName={tool?.name}
      authSlot={
        <div className="flex items-center gap-1">
          <Link
            href="/settings"
            aria-label="Settings"
            title="Settings"
            className={iconBtnClass}
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
          </Link>
          <SignOutButton iconOnly />
        </div>
      }
    />
  )
}
