import Link from "next/link"
import { cookies } from "next/headers"
import { Settings } from "lucide-react"
import { readSession, SESSION_COOKIE } from "@/lib/session"
import { SignOutButton } from "@/components/sign-out-button"
import { headerIconButtonClass, headerSecondaryLinkClass } from "@/lib/site-chrome"

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
    <div className="flex items-center">
      <Link
        href="/settings"
        aria-label="Settings"
        title="Settings"
        className={headerIconButtonClass}
      >
        <Settings aria-hidden="true" />
      </Link>
      <SignOutButton />
    </div>
  )
}
