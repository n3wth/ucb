import { Suspense } from "react"
import { UcbLogo } from "@/components/ucb-logo"
import { LoginForm } from "@/components/login-form"
import { Mail, Calendar, FolderPlus } from "lucide-react"

export const dynamic = "force-dynamic"

const FEATURES = [
  {
    icon: Mail,
    title: "Producer confirmations",
    description: "Confirmation emails sent automatically with every booking.",
  },
  {
    icon: Calendar,
    title: "Calendar sync",
    description: "Events added to the shared UCB calendar with one click.",
  },
  {
    icon: FolderPlus,
    title: "Drive organization",
    description: "Show folders created in the venue's Google Drive.",
  },
]

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Top bar — matches ucbcomedy.com */}
      <div className="bg-sidebar border-b border-sidebar-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UcbLogo size={32} showEyes={false} className="invert" />
            <span className="font-display text-sm uppercase tracking-wide text-sidebar-foreground">
              UCB Bookings
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

      {/* Split landing: hero + login */}
      <div className="flex-1 container mx-auto px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-20 items-start max-w-6xl mx-auto">
          {/* Left — hero */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground border border-border rounded-full px-3 py-1.5 bg-card">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                Internal booking tool
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase leading-[0.95] tracking-tight text-foreground text-balance">
                One form.
                <br />
                <span className="text-primary">Every show</span> confirmed.
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed max-w-md text-pretty">
                The operations hub for UCB&apos;s artistic team. Fill out show details
                once — the producer email, calendar event, and Drive folder are all
                handled automatically.
              </p>
            </div>

            {/* Feature list */}
            <ul className="space-y-5 border-t border-border pt-8">
              {FEATURES.map((feature) => (
                <li key={feature.title} className="flex gap-4">
                  <div className="shrink-0 h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                    <feature.icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1 pt-1">
                    <div className="font-medium text-sm text-foreground">{feature.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — login */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto lg:sticky lg:top-8">
            <div className="mb-6">
              <h2 className="font-display text-sm uppercase tracking-wide text-foreground mb-1.5">
                Team Access
              </h2>
              <p className="text-xs text-muted-foreground">
                Sign in with the shared team password to get started.
              </p>
            </div>
            <Suspense fallback={<LoginFormSkeleton />}>
              <LoginForm />
            </Suspense>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 mt-6">
              For UCB staff only · Questions? Contact the artistic team.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-auto">
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

function LoginFormSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4 animate-pulse">
      <div className="h-4 w-20 bg-muted rounded" />
      <div className="h-11 bg-muted rounded" />
      <div className="h-11 bg-muted rounded" />
    </div>
  )
}
