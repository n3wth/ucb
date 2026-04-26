import Link from "next/link"
import { cookies } from "next/headers"
import { Settings } from "lucide-react"
import { readSession, SESSION_COOKIE } from "@/lib/session"
import { SignOutButton } from "@/components/sign-out-button"
import { headerSecondaryLinkClass } from "@/lib/site-chrome"

const iconBtnClass =
  "inline-flex items-center justify-center h-8 w-8 rounded-sm text-foreground/60 hover:text-foreground hover:bg-foreground/[0.05] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/**
 * Server component that renders the right-side auth slot for SiteHeader.
 * Authed: icon-only Settings + Sign out (logo top-left already covers Home).
 * Unauthed: a single "Sign in" link.
 */
export async function HeaderAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const session = await readSession(token)

  if (!session) {
    return (
      <Link href="/login" className={headerSecondaryLinkClass}>
        Sign in
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/settings"
        aria-label="Settings"
        title="Settings"
        className={iconBtnClass}
      >
        <Settings className="h-4 w-4" aria-hidden="true" />
      </Link>
      <SignOutButton iconOnly />
    </div>
  )
}
