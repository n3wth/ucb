import type { ReactNode } from "react"
import { ToolsHeader } from "@/components/tools-header"

/**
 * Shared layout for everything under /tools.
 * Renders the header (which auto-detects the current tool name) and a
 * consistent page container. Tool pages only need to render their content.
 */
export default function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <ToolsHeader />
      <div className="container mx-auto px-6 py-10 sm:py-14">{children}</div>
    </main>
  )
}
