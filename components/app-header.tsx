"use client"

import Image from "next/image"
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
      <div className="h-1 w-full bg-primary" aria-hidden="true" />
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/ucb.svg"
              alt="UCB"
              width={36}
              height={36}
              className="h-9 w-9 invert"
              priority
            />
            <div>
              <div className="font-display text-sm uppercase tracking-wider leading-none">
                {APP_NAME.replace("UCB ", "")}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">
                {APP_TAGLINE}
              </div>
            </div>
          </div>
          {showSignOut && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="uppercase tracking-wider text-xs hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          )}
        </div>
      </header>
    </>
  )
}
