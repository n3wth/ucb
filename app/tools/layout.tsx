import type { ReactNode } from "react"
import { ToolsHeaderWrapper } from "@/components/tools-header-wrapper"
import { SiteFooter } from "@/components/site-footer"

/**
 * Shared layout for everything under /tools.
 * Renders the site header (with tool name auto-detected from the URL) and
 * site footer so tool pages only need to render their content.
 */
export default function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <ToolsHeaderWrapper />
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14 flex-1 w-full">{children}</div>
      <SiteFooter />
    </main>
  )
}
