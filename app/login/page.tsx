import { Suspense } from "react"
import { UcbLogo } from "@/components/ucb-logo"
import { LoginForm } from "@/components/login-form"
import { APP_NAME, APP_TAGLINE } from "@/lib/config"

export const dynamic = "force-dynamic"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" aria-hidden="true" />
      
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          {/* Logo and branding */}
          <div className="flex flex-col items-center gap-8 mb-10">
            <div className="relative group">
              {/* Ambient glow */}
              <div 
                className="absolute inset-0 bg-primary/15 blur-3xl rounded-full scale-[2] opacity-60 group-hover:opacity-80 transition-opacity duration-500" 
                aria-hidden="true" 
              />
              <UcbLogo size={80} className="relative" />
            </div>
            
            <div className="text-center space-y-3">
              <h1 className="font-display text-2xl uppercase tracking-wide text-foreground">
                {APP_NAME.replace("UCB ", "")}
              </h1>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {APP_TAGLINE}
              </p>
            </div>
          </div>
          
          {/* Login form */}
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
          
          {/* Footer hint */}
          <p className="text-center text-[10px] text-muted-foreground/60 mt-8 uppercase tracking-wider">
            Internal tool for UCB artistic team
          </p>
        </div>
      </div>
    </main>
  )
}

function LoginFormSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4 animate-pulse">
      <div className="h-4 w-20 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
    </div>
  )
}
