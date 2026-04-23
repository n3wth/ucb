import Link from "next/link"
import { UcbLogo } from "@/components/ucb-logo"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { APP_NAME } from "@/lib/config"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="bg-sidebar border-b border-sidebar-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UcbLogo size={32} showEyes={false} className="invert" />
            <span className="font-display text-base uppercase tracking-wide text-sidebar-foreground">
              {APP_NAME}
            </span>
          </div>
          <a
            href="https://ucbcomedy.com"
            className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
          >
            ucbcomedy.com
          </a>
        </div>
      </div>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-xl w-full text-center space-y-8">
          <h1 className="font-display text-4xl sm:text-5xl uppercase leading-[0.95] tracking-tight text-balance">
            Internal tools for the <span className="text-primary">UCB artistic team</span>.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Sign in to access booking tools, producer confirmations, and the rest of the artistic
            team&apos;s workflow.
          </p>
          <div className="flex items-center justify-center">
            <Button asChild size="lg" className="h-11 px-6 font-display uppercase tracking-wide text-sm group">
              <Link href="/login">
                Staff sign in
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-5">
        <div className="container mx-auto px-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            © {new Date().getFullYear()} Upright Citizens Brigade
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            ucbbookings.com
          </p>
        </div>
      </footer>
    </main>
  )
}
