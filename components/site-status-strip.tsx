import { LiveTimestamp } from "@/components/live-timestamp"

/**
 * Thin terminal-style strip rendered directly under SiteHeader on every page.
 * Left: "UCB · Internal" label.
 * Right: live NY/LA timestamp (NY-only on small screens to avoid overflow).
 */
export function SiteStatusStrip() {
  return (
    <div className="border-b border-border/80 bg-background/60">
      <div className="app-shell flex items-center justify-between h-7 sm:h-8 text-[10px] sm:text-[11px] text-muted-foreground tabular-nums">
        <span className="tracking-[0.18em] uppercase font-medium">UCB &middot; Internal</span>
        <LiveTimestamp className="hidden sm:inline" />
        <LiveTimestamp className="sm:hidden" nyOnly />
      </div>
    </div>
  )
}
