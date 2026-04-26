"use client"

import Link from "next/link"
import { Settings } from "lucide-react"
import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SignOutButton } from "@/components/sign-out-button"
import { getActiveToolByPathname } from "@/lib/tools"
import { headerIconButtonClass } from "@/lib/site-chrome"

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
            className={headerIconButtonClass}
          >
            <Settings aria-hidden="true" />
          </Link>
          <SignOutButton />
        </div>
      }
    />
  )
}
