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
          <div className="mx-auto max-w-6xl w-full px-6 pt-10 pb-16 sm:pt-14 sm:pb-20">

            {/* Date stamp — bare, no rule, slightly tilted */}
            <div className="mb-12 sm:mb-16">
              <span
                className="inline-block text-[10px] tracking-[0.4em] uppercase text-foreground/45 font-mono rotate-[-1.5deg] origin-left"
                aria-label={`Today is ${todayLong}`}
              >
                {todayLong}
              </span>
            </div>

            {/* Main content: stacked, off-axis, ransom-note typography */}
            <div className="relative">

              {/* Hero — words are physical objects, each tilted differently */}
              <div className="relative mb-10 sm:mb-14">
                <p className="mb-6 text-[10px] tracking-[0.5em] uppercase text-primary font-mono rotate-[1deg] inline-block origin-left">
                  ◆ IN HOUSE
                </p>

                {/* UCB logo + meta — pushed to a corner-ish spot, tilted */}
                <div className="mb-4 sm:mb-6 flex items-end gap-5">
                  <div className="rotate-[-5deg] origin-bottom-left">
                    <UcbLogo
                      size={130}
                      className="sm:!w-[170px] sm:!h-[170px] lg:!w-[210px] lg:!h-[210px]"
                    />
                  </div>
                  <div className="hidden sm:flex flex-col gap-1 pb-2 rotate-[2deg] origin-bottom-left">
                    <span className="text-[9px] tracking-[0.4em] uppercase text-foreground/40 font-mono">
                      Upright Citizens Brigade
                    </span>
                    <span className="text-[9px] tracking-[0.4em] uppercase text-foreground/30 font-mono">
                      Est. MCMXCVI · NY · LA
                    </span>
                  </div>
                </div>

                {/* Headline: each word tilted independently, mixed display + serif italic */}
                <h1 className="leading-[0.85] tracking-tight uppercase">
                  {/* Visually-hidden plain text for assistive tech & tests */}
                  <span className="sr-only">
                    Internal booking tools for the UCB artistic team.
                  </span>

                  <span aria-hidden className="block">
                    {/* Line 1: "Internal" — display, big, slight tilt */}
                    <span className="font-display block text-[3rem] sm:text-[5rem] lg:text-[7rem] text-foreground rotate-[-2deg] origin-bottom-left inline-block">
                      Internal
                    </span>
                  </span>

                  <span aria-hidden className="block -mt-1 sm:-mt-2 pl-[0.4em]">
                    {/* Line 2: "Booking" condensed/wide spaced */}
                    <span className="font-display block text-[2.6rem] sm:text-[4.4rem] lg:text-[6rem] text-foreground/85 tracking-[-0.02em] rotate-[1deg] origin-top-left inline-block">
                      Booking
                    </span>
                  </span>

                  <span aria-hidden className="block mt-1 sm:mt-2">
                    {/* Line 3: "Tools" + serif italic "for the" stuck on, ransom-note */}
                    <span className="font-display text-[2.6rem] sm:text-[4.4rem] lg:text-[6rem] text-foreground rotate-[-1deg] inline-block align-baseline">
                      Tools
                    </span>
                    <span className="font-serif italic font-normal normal-case tracking-normal text-foreground/60 text-xl sm:text-3xl lg:text-4xl ml-3 sm:ml-5 rotate-[3deg] inline-block align-baseline">
                      for&nbsp;the
                    </span>
                  </span>

                  {/* Line 4: UCB — huge, glitching, dramatic tilt off-axis */}
                  <span aria-hidden className="block mt-2 sm:mt-3 -ml-1 sm:-ml-2">
                    <span
                      className="font-display landing-glitch text-primary text-[5rem] sm:text-[8rem] lg:text-[12rem] leading-none rotate-[-4deg] origin-bottom-left inline-block"
                      data-text="UCB"
                    >
                      UCB
                    </span>
                  </span>

                  {/* Line 5: serif italic "Artistic Team" — handwritten feel */}
                  <span aria-hidden className="block mt-3 sm:mt-4 pl-2 sm:pl-4">
                    <span className="font-serif italic font-normal normal-case tracking-normal text-foreground/70 text-2xl sm:text-4xl lg:text-5xl rotate-[-2deg] inline-block">
                      Artistic
                    </span>
                    <span className="font-serif italic font-bold normal-case tracking-normal text-primary text-2xl sm:text-4xl lg:text-5xl ml-2 sm:ml-3 rotate-[2deg] inline-block">
                      Team.
                    </span>
                  </span>
                </h1>
              </div>

              {/* CTA strip — no decorative line, just objects floating */}
              <div className="relative mt-4 sm:mt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 sm:gap-10">
                  {/* Tagline: zine-style stacked words, no border */}
                  <div className="rotate-[-3deg] origin-bottom-left">
                    <p className="font-display uppercase leading-[0.9]">
                      <span className="block text-2xl sm:text-3xl text-foreground">Don&apos;t</span>
                      <span className="block text-2xl sm:text-3xl text-foreground/50 pl-3">think.</span>
                      <span className="block text-3xl sm:text-4xl text-primary pl-1 -mt-1">Book.</span>
                    </p>
                  </div>

                  {/* CTA button */}
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-3 border-2 border-primary bg-primary px-6 py-4 text-sm font-bold tracking-[0.25em] uppercase text-primary-foreground hover:bg-foreground hover:text-background hover:border-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cta-shimmer landing-cta-tilt"
                  >
                    <span>Sign in</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  {/* Live indicator */}
                  <div className="hidden sm:flex items-center gap-2 ml-auto pb-2 rotate-[-2deg]">
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
