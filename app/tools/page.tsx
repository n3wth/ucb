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
    <main className="min-h-screen bg-background">
      <AppHeader />

      <div className="container mx-auto px-6 py-10 sm:py-14">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Tools
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Internal tools for the UCB artistic team.
            </p>
          </div>

          {available.length > 0 ? (
            <ul className="divide-y divide-border border-y border-border">
              {available.map((tool) => (
                <ToolRow key={tool.id} tool={tool} />
              ))}
            </ul>
          ) : (
            <div className="border border-dashed border-border rounded-lg py-16 text-center">
              <p className="text-sm text-muted-foreground">
                No tools available yet.
              </p>
            </div>
          )}

          {comingSoon.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xs font-medium text-muted-foreground mb-3">
                Coming soon
              </h2>
              <ul className="divide-y divide-border border-y border-border">
                {comingSoon.map((tool) => (
                  <ToolRow key={tool.id} tool={tool} />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
