import Link from "next/link"
import { Suspense } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { LoginForm } from "@/components/login-form"

export const dynamic = "force-dynamic"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader
        authSlot={
          <Link
            href="/"
            className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-foreground underline underline-offset-[6px] decoration-1 hover:text-primary hover:decoration-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Back
          </Link>
        }
      />

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      <SiteFooter />
    </main>
  )
}

function LoginFormSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4 animate-pulse">
      <div className="h-4 w-20 bg-muted rounded" />
      <div className="h-11 bg-muted rounded" />
      <div className="h-11 bg-muted rounded" />
    </div>
  )
}
