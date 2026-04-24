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
          <div className="mx-auto max-w-6xl px-6 pt-12 pb-16 sm:pt-16 sm:pb-20">

            {/* Top rule */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-foreground/40" />
              <span className="text-[10px] tracking-[0.4em] uppercase text-foreground/50 font-mono">
                {todayLong}
              </span>
              <div className="h-px flex-1 bg-foreground/40" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
              {/* Hero block */}
              <div className="lg:col-span-8 border-2 border-foreground p-8 sm:p-12 relative">
                {/* Corner marks */}
                <span aria-hidden className="absolute top-2 left-2 text-[8px] font-mono text-foreground/30 tracking-widest">▮▮▮</span>
                <span aria-hidden className="absolute top-2 right-2 text-[8px] font-mono text-foreground/30 tracking-widest">▮▮▮</span>

                <p className="mb-5 text-[10px] tracking-[0.45em] uppercase text-primary font-mono">
                  ◆ IN HOUSE
                </p>

                <h1 className="font-display text-5xl sm:text-6xl lg:text-[5rem] leading-[0.92] tracking-tight uppercase">
                  <span className="block">Internal tools for the</span>{" "}
                  <span className="block text-primary landing-glitch" data-text="UCB">
                    UCB
                  </span>{" "}
                  <span className="block italic font-serif text-3xl sm:text-4xl lg:text-[2.8rem] font-normal normal-case tracking-normal text-foreground/80 mt-2">
                    artistic team.
                  </span>
                </h1>

                <div className="mt-10 flex items-center gap-4">
                  <div className="h-px w-12 bg-primary" />
                  <p className="text-xs tracking-[0.3em] uppercase text-foreground/40 font-mono">
                    Est. MCMXCVI · NY · LA
                  </p>
                </div>
              </div>

              {/* CTA block */}
              <div className="lg:col-span-4 border-2 border-l-0 border-foreground flex flex-col">
                <div className="border-b-2 border-foreground px-6 py-4">
                  <p className="text-[9px] tracking-[0.45em] uppercase text-foreground/40 font-mono">
                    ACCESS
                  </p>
                </div>

                <div className="flex-1 px-6 py-8 flex flex-col gap-6">
                  <p className="text-sm leading-relaxed text-foreground/60 font-mono">
                    Staff only.<br />
                    Don&apos;t think. Book.
                  </p>

                  <Link
                    href="/login"
                    className="group mt-auto inline-flex w-full items-center justify-between gap-3 border-2 border-primary bg-primary px-5 py-4 text-sm font-bold tracking-[0.25em] uppercase text-primary-foreground hover:bg-foreground hover:text-background hover:border-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cta-shimmer"
                  >
                    <span>Sign in</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                <div className="border-t-2 border-foreground px-6 py-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary landing-pulse" />
                    <span className="text-[9px] tracking-[0.4em] uppercase text-foreground/40 font-mono">
                      Live
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom rule */}
            <div className="mt-0 border-t-0 border-b-2 border-x-2 border-foreground px-8 py-3 flex items-center justify-between gap-4">
              <span className="text-[9px] tracking-[0.4em] uppercase text-foreground/30 font-mono">
                ◀ UCB BOOKINGS INTERNAL
              </span>
              <span className="text-[9px] tracking-[0.4em] uppercase text-foreground/30 font-mono">
                v2 ▶
              </span>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  )
}
