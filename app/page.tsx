import Link from "next/link"
import { UcbLogo } from "@/components/ucb-logo"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { APP_NAME } from "@/lib/config"

const TICKER_WORDS = [
  "Bookings",
  "Confirmations",
  "Calendars",
  "Folders",
  "Producers",
  "Tech rehearsals",
  "Showtimes",
  "Rundowns",
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background bg-grain flex flex-col">
      {/* Top bar */}
      <div className="bg-sidebar border-b border-sidebar-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UcbLogo size={32} showEyes={false} className="invert" />
            <span className="font-display text-base uppercase tracking-wide text-sidebar-foreground">
              {APP_NAME}
            </span>
          </div>
          <a
            href="https://ucbcomedy.com"
            className="text-eyebrow text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
          >
            ucbcomedy.com
          </a>
        </div>
      </div>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-6 py-20 sm:py-28">
        <div className="max-w-3xl w-full text-center space-y-10">
          {/* Live indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card shadow-ambient-sm">
            <span className="status-dot" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-foreground">
              Internal · Staff only
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display uppercase leading-[0.92] tracking-[-0.03em] text-balance text-5xl sm:text-6xl md:text-7xl">
            Tools for the
            <br />
            <span className="text-primary">UCB artistic</span>
            <br />
            team.
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto text-pretty">
            A growing set of internal tools that keep the booking, production,
            and producer workflow running smoothly.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 px-7 font-display uppercase tracking-wide text-sm shadow-brand group"
            >
              <Link href="/login">
                Staff sign in
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Marching marquee — theatre ticker vibe */}
      <div className="border-y border-border bg-card/60 py-5 marquee">
        <div className="marquee-track">
          {[...TICKER_WORDS, ...TICKER_WORDS].map((word, i) => (
            <div key={i} className="flex items-center gap-6 pr-6 shrink-0">
              <span className="font-display uppercase text-xl tracking-tight text-foreground/80">
                {word}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6">
        <div className="container mx-auto px-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-eyebrow">
            © {new Date().getFullYear()} Upright Citizens Brigade
          </p>
          <p className="text-eyebrow">
            ucbbookings.com
          </p>
        </div>
      </footer>
    </main>
  )
}
