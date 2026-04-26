import Link from "next/link"
import { cookies } from "next/headers"
import { readSession, SESSION_COOKIE } from "@/lib/session"
import { SignOutButton } from "@/components/sign-out-button"
import { headerSecondaryLinkClass } from "@/lib/site-chrome"

/**
 * Server component that renders the right-side auth slot for SiteHeader.
 * Authed: shows a small email + Sign out cluster.
 * Unauthed: shows a Sign in link.
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
    <div className="flex items-center gap-3">
      {session.email ? (
        <span
          className="hidden md:inline text-[10px] sm:text-xs text-muted-foreground tracking-[0.04em] truncate max-w-[180px]"
          title={session.email}
        >
          {session.email}
        </span>
      ) : null}
      <SignOutButton />
    </div>
  )
}
