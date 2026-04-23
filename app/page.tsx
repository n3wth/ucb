import Link from "next/link"
import { UcbLogo } from "@/components/ucb-logo"

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
  const year = new Date().getFullYear()

  return (
    <main className="min-h-screen bg-background bg-grain flex flex-col">
      {/* Minimal top bar — logo + sign-in affordance only */}
      <header className="bg-sidebar text-sidebar-foreground">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UcbLogo size={28} showEyes={false} className="invert" />
            <span className="sr-only">UCB Bookings</span>
          </div>
          <Link
            href="/login"
            className="text-[11px] uppercase tracking-[0.25em] text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm px-1 py-0.5"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Editorial mast — type-led, left-anchored */}
      <section className="flex-1 flex flex-col">
        <div className="container mx-auto px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 flex-1">
          <div className="flex items-start justify-between gap-4 mb-16 sm:mb-24">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Volume 01 — Est. {year}
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hidden sm:inline">
              UCB / Internal
            </span>
          </div>

          <h1 className="font-display uppercase leading-[0.82] tracking-[-0.045em] text-[clamp(3.5rem,13vw,11rem)] text-foreground text-balance">
            UCB<br />
            Bookings<span className="text-primary">.</span>
          </h1>

          <div className="mt-12 sm:mt-16 grid grid-cols-12 gap-6">
            <div className="col-span-12 sm:col-span-5 sm:col-start-8">
              <p className="text-lg sm:text-xl leading-snug text-foreground/90 text-pretty">
                Internal tools for the UCB artistic team. Show confirmations,
                calendars, and the rest of what keeps the stage running.
              </p>
              <div className="mt-8 flex items-center gap-5 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="status-dot" aria-hidden="true" />
                  Staff access only
                </span>
                <span aria-hidden="true" className="h-px w-8 bg-border" />
                <Link href="/login" className="text-foreground hover:text-primary transition-colors">
                  Continue →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee — keeps the theatre rhythm */}
        <div className="border-y border-border bg-card/60 py-5 marquee">
          <div className="marquee-track">
            {[...TICKER_WORDS, ...TICKER_WORDS, ...TICKER_WORDS].map((word, i) => (
              <div key={i} className="flex items-center gap-6 pr-6 shrink-0">
                <span className="font-display uppercase text-lg tracking-tight text-foreground/80">
                  {word}
                </span>
                <span className="h-1 w-1 rounded-full bg-primary/60" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Colophon-style footer */}
      <footer className="py-6">
        <div className="container mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <p>© {year} Upright Citizens Brigade</p>
          <p>ucbbookings.com</p>
        </div>
      </footer>
    </main>
  )
}
