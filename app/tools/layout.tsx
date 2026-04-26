import type { ReactNode } from "react"
import { ToolsHeaderWrapper } from "@/components/tools-header-wrapper"
import { ToolsNav } from "@/components/tools-nav"
import { SiteFooter } from "@/components/site-footer"

/**
 * Shared layout for everything under /tools.
 * Renders the site header (with tool name auto-detected from the URL) and
 * site footer so tool pages only need to render their content.
 */
export default function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <ToolsHeaderWrapper />
      <ToolsNav />
      <div className="app-shell page-fade-in flex-1 w-full py-8 sm:py-11 lg:py-12">{children}</div>
      <SiteFooter />
    </main>
  )
}
