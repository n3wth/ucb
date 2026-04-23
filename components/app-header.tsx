"use client"

import { UcbLogo } from "@/components/ucb-logo"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { APP_NAME } from "@/lib/config"

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
    <header className="bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <UcbLogo size={36} showEyes={false} className="invert" />
          <div className="flex flex-col">
            <span className="font-display text-sm uppercase tracking-wide leading-tight text-sidebar-foreground">
              {APP_NAME.replace("UCB ", "")}
            </span>
            <span className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest mt-0.5">
              Internal booking tool
            </span>
          </div>
        </div>
        {showSignOut && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            Sign out
          </Button>
        )}
      </div>
    </header>
  )
}
