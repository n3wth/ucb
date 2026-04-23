"use client"

import { UcbLogo } from "@/components/ucb-logo"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { APP_NAME, APP_TAGLINE } from "@/lib/config"

interface AppHeaderProps {
  showSignOut?: boolean
}

export function AppHeader({ showSignOut = true }: AppHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      <div className="h-0.5 w-full bg-gradient-to-r from-primary/80 via-primary to-primary/80" aria-hidden="true" />
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <UcbLogo size={32} />
            <div className="flex flex-col">
              <span className="font-display text-sm uppercase tracking-wide leading-tight text-foreground">
                {APP_NAME.replace("UCB ", "")}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                {APP_TAGLINE}
              </span>
            </div>
          </div>
          {showSignOut && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Sign out
            </Button>
          )}
        </div>
      </header>
    </>
  )
}
