"use client"

import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SignOutButton } from "@/components/sign-out-button"
import { TOOLS } from "@/lib/tools"

export function ToolsHeaderWrapper() {
  const pathname = usePathname()

  const tool = TOOLS.filter(
    (t) => pathname === t.href || pathname.startsWith(t.href + "/"),
  ).sort((a, b) => b.href.length - a.href.length)[0]

  return <SiteHeader toolName={tool?.name} authSlot={<SignOutButton />} />
}
