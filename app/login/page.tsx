import Link from "next/link"
import { Suspense } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { LoginForm } from "@/components/login-form"
import { headerSecondaryLinkClass } from "@/lib/site-chrome"

export const dynamic = "force-dynamic"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader
        authSlot={
          <Link
            href="/"
            className={headerSecondaryLinkClass}
          >
            Back
          </Link>
        }
      />

      <div className="flex-1 flex items-center justify-center app-shell page-fade-in py-16 sm:py-20">
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
    <div className="surface-panel p-6 sm:p-7 space-y-4 animate-pulse">
      <div className="h-4 w-20 bg-muted rounded" />
      <div className="h-11 bg-muted rounded" />
      <div className="h-11 bg-muted rounded" />
    </div>
  )
}
