import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { UcbLogo } from "@/components/ucb-logo"

export const metadata = {
  title: "Page not found",
}

export default function NotFound() {
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
            <div className="mb-6">
              <UcbLogo size={64} />
            </div>
            <p className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
              404
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground leading-tight text-balance">
              This page isn&rsquo;t on tonight&rsquo;s lineup.
            </h1>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              The link may have moved, or the show was pulled. Head back to the
              main stage.
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
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
