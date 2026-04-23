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
  }).format(date)
}

export default function LandingPage() {
  const now = new Date()
  const todayLong = formatToday(now).toUpperCase()

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
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

      <section className="flex-1">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-8">
              <h1 className="font-serif text-5xl sm:text-7xl lg:text-[5.75rem] leading-[0.95] tracking-tight text-balance">
                Internal tools for the{" "}
                <em className="not-italic text-primary font-black">UCB</em>
                <span className="italic font-normal"> artistic team.</span>
              </h1>
            </div>

            <aside className="lg:col-span-4 lg:pt-2">
              <div className="border-t-2 border-foreground pt-4">
                <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/60 font-semibold">
                  Today
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

      <SiteFooter />
    </main>
  )
}
