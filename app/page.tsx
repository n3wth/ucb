import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { UcbLogo } from "@/components/ucb-logo"

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

      {/* Tilted background accent bar */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -left-20 top-1/3 w-[60vw] h-[2px] bg-primary/20 origin-left rotate-[-8deg]" />
        <div className="absolute right-0 bottom-1/3 w-[40vw] h-[1px] bg-foreground/10 origin-right rotate-[6deg]" />
      </div>

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
          <div className="mx-auto max-w-6xl px-6 pt-4 pb-6 sm:pt-6 sm:pb-8 w-full">

            {/* Date stamp — tilted left edge */}
            <div className="flex items-center gap-4 mb-4 sm:mb-5">
              <div className="w-1 h-8 bg-primary rotate-[-4deg] shrink-0" />
              <span className="text-[10px] tracking-[0.4em] uppercase text-foreground/50 font-mono">
                {todayLong}
              </span>
              <div className="h-px flex-1 bg-foreground/20" />
            </div>

            {/* Main content: stacked, off-axis cards */}
            <div className="relative">

              {/* Hero headline — large, bleeds off grid */}
              <div className="relative mb-5 sm:mb-6">
                <p className="mb-2 text-[10px] tracking-[0.5em] uppercase text-primary font-mono">
                  ◆ IN HOUSE
                </p>

                {/* Prominent UCB logo — stamped above the headline */}
                <div className="mb-3 sm:mb-4 flex items-center gap-4">
                  <div className="rotate-[-3deg] origin-bottom-left">
                    <UcbLogo
                      size={72}
                      showEyes={false}
                      className="sm:!w-[96px] sm:!h-[96px] lg:!w-[120px] lg:!h-[120px]"
                    />
                  </div>
                  <div className="hidden sm:flex flex-col gap-1 pb-2">
                    <span className="text-[9px] tracking-[0.4em] uppercase text-foreground/40 font-mono">
                      Upright Citizens Brigade
                    </span>
                    <span className="text-[9px] tracking-[0.4em] uppercase text-foreground/30 font-mono">
                      Est. MCMXCVI · NY · LA
                    </span>
                  </div>
                </div>

                <h1 className="font-display leading-[0.88] tracking-tight uppercase">
                  <span className="block text-3xl sm:text-5xl lg:text-[4rem] text-foreground">
                    Internal Booking Tools{" "}
                  </span>
                  <span className="block text-3xl sm:text-5xl lg:text-[4rem] text-foreground/40 pl-[0.08em] sm:pl-[0.15em]">
                    for the{" "}
                  </span>
                  <span
                    className="block text-5xl sm:text-7xl lg:text-[6.5rem] text-primary landing-glitch"
                    data-text="UCB"
                  >
                    UCB{" "}
                  </span>
                  <span className="block font-serif italic text-lg sm:text-xl lg:text-2xl text-foreground/60 font-normal normal-case tracking-normal mt-2 pl-1">
                    Artistic Team.
                  </span>
                </h1>
              </div>

              {/* CTA strip — tilted, punchy */}
              <div className="relative mt-2">
                {/* Tilted accent line behind CTA */}
                <div
                  aria-hidden
                  className="absolute -left-6 top-1/2 w-[calc(100%+3rem)] h-px bg-foreground/10 rotate-[-1.5deg] origin-left pointer-events-none"
                />

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-8">
                  {/* Tagline */}
                  <div className="relative">
                    <div className="rotate-[-2deg] border border-foreground/30 px-3 py-2 bg-background inline-block">
                      <p className="text-xs text-foreground/50 font-mono leading-tight">
                        Don&apos;t think.<br />
                        Book.
                      </p>
                    </div>
                  </div>

                  {/* CTA button */}
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-3 border-2 border-primary bg-primary px-6 py-3 text-sm font-bold tracking-[0.25em] uppercase text-primary-foreground hover:bg-foreground hover:text-background hover:border-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cta-shimmer landing-cta-tilt"
                  >
                    <span>Sign in</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  {/* Live indicator */}
                  <div className="hidden sm:flex items-center gap-2 ml-auto">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary landing-pulse" />
                    <span className="text-[9px] tracking-[0.4em] uppercase text-foreground/40 font-mono">
                      Live
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  )
}
