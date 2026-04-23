import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { UcbLogo } from "@/components/ucb-logo"

export default function LandingPage() {
  const year = new Date().getFullYear()

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <UcbLogo size={22} showEyes={false} />
            <span className="text-sm font-semibold text-foreground">
              UCB Bookings
            </span>
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-lg">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground leading-tight text-balance">
              Internal tools for the UCB artistic team.
            </h1>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Confirm shows, manage calendars, and keep producers in the loop.
            </p>
            <div className="mt-8">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between text-xs text-muted-foreground">
          <span>© {year} Upright Citizens Brigade</span>
          <span className="hidden sm:inline">Staff access only</span>
        </div>
      </footer>
    </main>
  )
}
