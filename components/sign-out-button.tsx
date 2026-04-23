"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
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
