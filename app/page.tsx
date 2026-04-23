import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { UcbLogo } from "@/components/ucb-logo"

function formatToday(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export default function LandingPage() {
  const now = new Date()
  const year = now.getFullYear()
  const todayLong = formatToday(now).toUpperCase()

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b-2 border-foreground">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <UcbLogo size={28} showEyes={false} />
            <span className="font-display text-base tracking-[0.08em] uppercase">
              UCB Bookings
            </span>
          </div>
          <Link
            href="/login"
            className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-foreground underline underline-offset-[6px] decoration-1 hover:text-primary hover:decoration-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Stage Door
          </Link>
        </div>
        <div className="border-t border-foreground/30">
          <div className="mx-auto max-w-6xl px-6 py-2 flex items-center justify-between gap-4 text-[10px] sm:text-xs tracking-[0.22em] uppercase text-foreground/70 font-medium">
            <span>Established MCMXCVI</span>
            <span>New York · Los Angeles</span>
          </div>
        </div>
      </header>

      <section className="flex-1">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-8">
              <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-primary font-semibold">
                Tonight&rsquo;s Program
              </p>
              <div aria-hidden className="mt-4 h-px w-20 bg-foreground" />
              <h1 className="mt-6 font-serif text-5xl sm:text-7xl lg:text-[5.75rem] leading-[0.95] tracking-tight text-balance">
                Internal tools for the{" "}
                <em className="not-italic text-primary font-black">UCB</em>
                <br className="hidden sm:block" />
                <span className="italic font-normal"> artistic team.</span>
              </h1>
              <p className="mt-10 max-w-xl font-serif text-lg sm:text-xl leading-relaxed text-foreground/80">
                Staff tools for confirming shows, managing calendars, and
                keeping producers in the loop — run by the theater, for the
                theater.
              </p>
            </div>

            <aside className="lg:col-span-4 lg:pt-2">
              <div className="border-t-2 border-foreground pt-4">
                <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/60 font-semibold">
                  This Performance
                </p>
                <p className="mt-3 font-display text-xl sm:text-2xl tracking-[0.04em] uppercase leading-tight">
                  {todayLong}
                </p>
                <div aria-hidden className="mt-6 h-px w-full bg-foreground/20" />
                <p className="mt-6 text-sm leading-relaxed text-foreground/70">
                  Admission by staff credential. One door in, one door out —
                  the stage door.
                </p>
                <Link
                  href="/login"
                  className="group mt-8 inline-flex w-full items-center justify-between gap-3 border-2 border-foreground bg-foreground px-5 py-4 text-sm font-semibold tracking-[0.2em] uppercase text-background hover:bg-primary hover:border-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-foreground">
        <div className="mx-auto max-w-6xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] sm:text-xs tracking-[0.25em] uppercase text-foreground/70 font-medium">
          <span>
            &copy; {year}&nbsp;&nbsp;Upright&nbsp;Citizens&nbsp;Brigade
          </span>
          <span>Staff Access Only</span>
          <span className="hidden sm:inline">Printed in the back office</span>
        </div>
      </footer>
    </main>
  )
}
