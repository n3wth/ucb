import type { Metadata } from "next"
import { AppHeader } from "@/components/app-header"
import { ToolRow } from "@/components/tool-card"
import { TOOLS } from "@/lib/tools"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Tools",
}

export default function ToolsHubPage() {
  const available = TOOLS.filter((t) => t.status === "available")
  const comingSoon = TOOLS.filter((t) => t.status === "coming-soon")

  return (
    <main className="min-h-screen bg-background bg-grain">
      <AppHeader />

      <div className="container mx-auto px-6 pt-16 sm:pt-24 pb-24">
        <div className="max-w-5xl mx-auto">
          {/* Editorial mast — no pills, no clutter */}
          <header className="flex items-end justify-between gap-6 flex-wrap mb-16 sm:mb-20">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
                Index
              </div>
              <h1 className="font-display uppercase tracking-[-0.04em] leading-none text-6xl sm:text-7xl md:text-8xl text-foreground">
                Tools
              </h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-[22rem] leading-snug text-pretty pb-3">
              Every internal tool for the UCB artistic team, in one place. More
              arrive as the workflow grows.
            </p>
          </header>

          {/* Editorial list — each tool is a full-width row */}
          {available.length > 0 && (
            <ul className="border-t border-border">
              {available.map((tool, i) => (
                <ToolRow key={tool.id} tool={tool} index={i + 1} />
              ))}
            </ul>
          )}

          {/* Coming soon — only rendered if items exist */}
          {comingSoon.length > 0 && (
            <section className="mt-20">
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  In the wings
                </h2>
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {comingSoon.length}
                </span>
              </div>
              <ul className="border-t border-border">
                {comingSoon.map((tool, i) => (
                  <ToolRow
                    key={tool.id}
                    tool={tool}
                    index={available.length + i + 1}
                  />
                ))}
              </ul>
            </section>
          )}

          {/* Empty state */}
          {available.length === 0 && comingSoon.length === 0 && (
            <div className="border-t border-b border-border py-24 text-center">
              <p className="text-sm text-muted-foreground">
                No tools configured yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
