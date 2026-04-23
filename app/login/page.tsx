import { Suspense } from "react"
import { UcbLogo } from "@/components/ucb-logo"
import { LoginForm } from "@/components/login-form"
import { APP_NAME } from "@/lib/config"

export const dynamic = "force-dynamic"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Dark header bar matching ucbcomedy.com */}
      <div className="bg-sidebar py-4 border-b border-sidebar-border">
        <div className="container mx-auto px-6 flex items-center justify-center gap-3">
          <UcbLogo size={32} showEyes={false} className="invert" />
          <span className="font-display text-sm uppercase tracking-wide text-sidebar-foreground">
            {APP_NAME}
          </span>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          {/* Logo and branding */}
          <div className="flex flex-col items-center gap-6 mb-8">
            <UcbLogo size={72} className="drop-shadow-sm" />
            
            <div className="text-center space-y-2">
              <h1 className="font-display text-xl uppercase tracking-wide text-foreground">
                Team Login
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your password to access the booking tool
              </p>
            </div>
          </div>
          
          {/* Login form */}
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
          
          {/* Footer hint */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            Internal tool for UCB artistic directors
          </p>
        </div>
      </div>
    </main>
  )
}

function LoginFormSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4 animate-pulse">
      <div className="h-4 w-20 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
    </div>
  )
}
