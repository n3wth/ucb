"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SignOutButton({ iconOnly = false }: { iconOnly?: boolean }) {
  const router = useRouter()

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  if (iconOnly) {
    return (
      <button
        onClick={handleSignOut}
        aria-label="Sign out"
        title="Sign out"
        className="inline-flex items-center justify-center h-8 w-8 rounded-sm text-foreground/60 hover:text-foreground hover:bg-foreground/[0.05] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
      </button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-foreground/60 hover:text-foreground hover:bg-transparent transition-colors"
    >
      <LogOut className="h-3.5 w-3.5 mr-1.5" />
      Sign out
    </Button>
  )
}
