import type { Metadata } from "next"
import { ToolPage } from "@/components/tool-page"
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
    <ToolPage title="Tools" description="Internal tools for the UCB artistic team.">
      {available.length > 0 ? (
        <ul className="surface-panel divide-y divide-border/90 overflow-hidden px-1.5 sm:px-2">
          {available.map((tool) => (
            <ToolRow key={tool.id} tool={tool} />
          ))}
        </ul>
      ) : (
        <div className="surface-panel py-20 sm:py-24 text-center px-4">
          <p className="text-sm text-muted-foreground">No tools available yet.</p>
        </div>
      )}

      {comingSoon.length > 0 && (
        <div className="mt-12">
          <h2 className="text-[11px] font-medium tracking-[0.2em] uppercase text-muted-foreground mb-3">
            Coming soon
          </h2>
          <ul className="surface-panel divide-y divide-border/90 overflow-hidden px-1.5 sm:px-2">
            {comingSoon.map((tool) => (
              <ToolRow key={tool.id} tool={tool} />
            ))}
          </ul>
        </div>
      )}
    </ToolPage>
  )
}
