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
    <main className="min-h-screen bg-background">
      <AppHeader />

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Page heading */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Dashboard
            </div>
            <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-tight text-foreground">
              Tools
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed pt-1">
              Pick a tool to get started. New tools are added here as the artistic team&apos;s
              workflow grows.
            </p>
          </div>

          {/* Available tools */}
          {available.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Available
                </h2>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  {available.length} tool{available.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {available.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          )}

          {/* Coming soon tools */}
          {comingSoon.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Coming soon
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {comingSoon.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
