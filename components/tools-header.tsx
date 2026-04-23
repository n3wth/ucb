"use client"

import { usePathname } from "next/navigation"
import { AppHeader } from "./app-header"
import { TOOLS } from "@/lib/tools"

/**
 * App header that auto-detects the current tool from the URL.
 * Rendered by `app/tools/layout.tsx` so individual tool pages don't need
 * to wire up the header themselves.
 */
export function ToolsHeader() {
  const pathname = usePathname()

  // Match the longest tool href that is a prefix of the current path.
  // Supports future sub-routes like `/tools/show-confirmation/history`.
  const tool = TOOLS.filter(
    (t) => pathname === t.href || pathname.startsWith(t.href + "/"),
  ).sort((a, b) => b.href.length - a.href.length)[0]

  return <AppHeader toolName={tool?.name} />
}
