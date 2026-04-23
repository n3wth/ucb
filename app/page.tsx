import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { UcbLogo } from "@/components/ucb-logo"

export default function LandingPage() {
  const now = new Date()
  const year = now.getFullYear()
  const dateLine = now
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase()

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Masthead */}
      <header className="border-b-[3px] border-foreground">
        <div className="mx-auto w-full max-w-[1200px] px-6 pt-6 pb-3">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-medium">
            <span>Est. 1996</span>
            <span className="hidden sm:inline">{dateLine}</span>
            <span className="text-right">Vol. {year - 1995} · No. {String(now.getMonth() + 1).padStart(2, "0")}</span>
          </div>
          <div className="mt-4 flex items-end justify-between gap-6">
            <div className="flex items-center gap-4">
              <UcbLogo size={44} showEyes={false} className="shrink-0" />
              <div className="leading-none">
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Upright Citizens Brigade
                </div>
                <div className="mt-1.5 font-playbill text-2xl sm:text-3xl text-foreground">
                  Staff Bookings
                </div>
              </div>
            </div>
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 border border-foreground px-3 h-8 text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-foreground hover:text-background transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="border-t border-foreground" />
      </header>

      {/* Playbill */}
      <section className="flex-1">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-16 sm:py-24 lg:py-28">
          {/* Program heading */}
          <div className="text-center">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
              The Artistic Team Presents
            </p>
            <div className="mt-8 sm:mt-10">
              <h1 className="font-playbill text-foreground leading-[0.9]">
                <span className="block text-[54px] sm:text-[96px] lg:text-[132px]">
                  TONIGHT
                </span>
                <span className="block italic font-normal text-[30px] sm:text-[52px] lg:text-[68px] mt-1 sm:mt-2">
                  &amp; every night
                </span>
                <span className="block text-[54px] sm:text-[96px] lg:text-[132px] text-primary mt-1 sm:mt-2">
                  THE SHOW
                </span>
                <span className="block italic font-normal text-[30px] sm:text-[52px] lg:text-[68px] mt-1 sm:mt-2">
                  goes on
                </span>
              </h1>
            </div>
            <p className="mt-10 sm:mt-12 text-[10px] sm:text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
              A program for the back-of-house
            </p>
          </div>

          {/* Double rule */}
          <div className="mt-12 sm:mt-16 mx-auto max-w-[780px]">
            <div className="border-t border-foreground" />
            <div className="mt-1 border-t border-foreground" />
          </div>

          {/* Program lineup */}
          <div className="mt-8 mx-auto max-w-[780px]">
            <p className="text-center text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              Featuring
            </p>
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-y-6 sm:gap-y-0 text-center">
              <ProgramItem roman="I" title="Confirmations" caption="Locking in the lineup" />
              <ProgramItem roman="II" title="Calendars" caption="Weeks, nights, rooms" />
              <ProgramItem roman="III" title="Producer Relay" caption="Keeping the loop closed" />
            </ul>
          </div>

          <div className="mt-12 mx-auto max-w-[780px]">
            <div className="border-t border-foreground" />
            <div className="mt-1 border-t border-foreground" />
          </div>

          {/* Call-to-action: stage door */}
          <div className="mt-14 sm:mt-20 flex flex-col items-center text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              Please enter through the
            </p>
            <p className="mt-2 font-playbill italic text-2xl sm:text-3xl text-foreground">
              stage door
            </p>
            <Link
              href="/login"
              className="mt-6 group inline-flex items-center gap-4 border-2 border-foreground bg-background px-7 sm:px-9 h-14 sm:h-16 text-foreground uppercase tracking-[0.3em] text-sm sm:text-base font-semibold hover:bg-foreground hover:text-background transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span>Sign in</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="mt-4 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              Staff credentials required
            </p>
          </div>
        </div>
      </section>

      {/* Program footer */}
      <footer className="mt-8">
        <div className="mx-auto w-full max-w-[1200px] px-6">
          <div className="border-t border-foreground" />
          <div className="mt-1 border-t border-foreground" />
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            <span>© {year} Upright Citizens Brigade</span>
            <span className="hidden sm:inline">Printed nightly · New York</span>
            <span>Staff access only</span>
          </div>
        </div>
      </footer>
    </main>
  )
}

function ProgramItem({
  roman,
  title,
  caption,
}: {
  roman: string
  title: string
  caption: string
}) {
  return (
    <li className="flex flex-col items-center">
      <span className="font-playbill italic text-sm text-muted-foreground">
        {roman}.
      </span>
      <span className="mt-1 font-playbill text-xl sm:text-2xl text-foreground">
        {title}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {caption}
      </span>
    </li>
  )
}
