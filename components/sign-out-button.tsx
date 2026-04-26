"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { headerIconButtonClass } from "@/lib/site-chrome"

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      aria-label="Sign out"
      title="Sign out"
      className={headerIconButtonClass}
    >
      <LogOut aria-hidden="true" />
    </button>
  )
}
