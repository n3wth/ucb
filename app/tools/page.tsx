import type { Metadata } from "next"
import { AppHeader } from "@/components/app-header"
import { ToolCard } from "@/components/tool-card"
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

      <div className="container mx-auto px-6 pt-16 pb-24">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Hero heading — editorial scale */}
          <header className="space-y-6">
            <div className="tag">
              <span className="status-dot" aria-hidden="true" />
              Dashboard · Signed in
            </div>
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <h1 className="font-display uppercase tracking-[-0.02em] text-5xl sm:text-6xl text-foreground leading-[0.95]">
                Tools
              </h1>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed pb-2">
                Pick a tool to get started. New ones show up here as the
                artistic team&apos;s workflow grows.
              </p>
            </div>
            <div className="h-px bg-border" />
          </header>

          {/* Available tools */}
          {available.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-4">
                  <span className="numeric-index text-xs text-muted-foreground">01</span>
                  <h2 className="font-display text-base uppercase tracking-wide text-foreground">
                    Available
                  </h2>
                </div>
                <span className="text-eyebrow">
                  {available.length} {available.length === 1 ? "tool" : "tools"}
                </span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {available.map((tool, i) => (
                  <ToolCard key={tool.id} tool={tool} index={i + 1} />
                ))}
              </div>
            </section>
          )}

          {/* Coming soon tools */}
          {comingSoon.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-baseline gap-4">
                <span className="numeric-index text-xs text-muted-foreground">02</span>
                <h2 className="font-display text-base uppercase tracking-wide text-foreground">
                  In the wings
                </h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {comingSoon.map((tool, i) => (
                  <ToolCard key={tool.id} tool={tool} index={available.length + i + 1} />
                ))}
              </div>
            </section>
          )}

          {/* Empty state fallback */}
          {available.length === 0 && comingSoon.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
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
