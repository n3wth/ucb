import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

function formatToday(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  }).format(date)
}

export default function LandingPage() {
  const now = new Date()
  const todayLong = formatToday(now).toUpperCase()

  return (
    <main className="relative min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* TV static noise overlay */}
      <div
        aria-hidden
        className="landing-static pointer-events-none absolute inset-0 z-0"
      />

      {/* Scanline effect */}
      <div
        aria-hidden
        className="landing-scanlines pointer-events-none absolute inset-0 z-0"
      />

      <div className="relative z-10 flex flex-col flex-1">
        <SiteHeader
          subStrip
          authSlot={
            <Link
              href="/login"
              className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-foreground underline underline-offset-[6px] decoration-1 hover:text-primary hover:decoration-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Stage Door
            </Link>
          }
        />

        <section className="flex-1 flex flex-col justify-center">
          <div className="mx-auto max-w-5xl px-8 pt-10 pb-16 sm:pt-14 sm:pb-20">

            {/* Dateline — small, quiet */}
            <p className="text-[10px] tracking-[0.45em] uppercase text-foreground/35 font-mono mb-14 sm:mb-20">
              {todayLong}
            </p>

            {/* Main typographic composition */}
            <div className="relative">

              {/* "IN HOUSE" — tilted label floating top-left */}
              <p
                className="landing-label-tilt absolute -top-6 left-0 text-[9px] tracking-[0.55em] uppercase text-primary font-mono select-none"
                aria-hidden
              >
                ◆ IN HOUSE
              </p>

              {/* "Internal tools" — large serif italic, slightly rotated */}
              <div className="landing-phrase-1 mb-2 sm:mb-4">
                <span className="font-serif italic text-4xl sm:text-5xl lg:text-6xl text-foreground/70 font-normal">
                  Internal tools
                </span>
              </div>

              {/* "for the" — small offset text */}
              <div className="landing-phrase-2 mb-1 pl-4 sm:pl-8">
                <span className="font-mono text-sm sm:text-base tracking-[0.25em] uppercase text-foreground/40">
                  for the
                </span>
              </div>

              {/* "UCB" — massive display, primary, slight tilt */}
              <div className="landing-ucb-wrap relative my-2 sm:my-4">
                <h1
                  className="font-display text-[5rem] sm:text-[8rem] lg:text-[12rem] leading-none tracking-tight uppercase text-primary landing-glitch landing-ucb-tilt"
                  data-text="UCB"
                >
                  UCB
                </h1>
              </div>

              {/* "artistic team" — serif italic, counter-tilted right-aligned */}
              <div className="landing-phrase-3 flex justify-end sm:justify-start sm:pl-16 lg:pl-28">
                <span className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-foreground/60 font-normal">
                  artistic team.
                </span>
              </div>

              {/* EST line — small, rotated, tucked lower */}
              <p
                className="landing-est absolute bottom-0 right-0 text-[9px] tracking-[0.4em] uppercase text-foreground/30 font-mono"
                aria-hidden
              >
                Est. MCMXCVI · NY · LA
              </p>
            </div>

            {/* CTA area — loose, not boxed */}
            <div className="mt-20 sm:mt-28 flex flex-col sm:flex-row items-start sm:items-end gap-8 sm:gap-16">

              <div className="landing-cta-wrap flex-1 max-w-xs">
                <p className="font-mono text-xs text-foreground/40 mb-6 leading-relaxed">
                  Staff only.<br />
                  Don&apos;t think. Book.
                </p>

                <Link
                  href="/login"
                  className="group inline-flex items-center gap-3 text-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="font-display text-lg sm:text-xl uppercase tracking-[0.2em]">
                    Sign in
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                {/* Underline — hand-drawn feel via a short irregular rule */}
                <div className="mt-3 h-px w-20 bg-primary landing-rule-draw" />
              </div>

              {/* Live badge — loose, not in a box */}
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block w-2 h-2 rounded-full bg-primary landing-pulse" />
                <span className="text-[9px] tracking-[0.4em] uppercase text-foreground/35 font-mono">
                  Live
                </span>
              </div>
            </div>

          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  )
}
