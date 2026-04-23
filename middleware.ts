import { NextRequest, NextResponse } from "next/server"
import { verifySession, SESSION_COOKIE } from "@/lib/session"

// Fully public pages/APIs that never require a session.
const PUBLIC_PATHS = ["/", "/login", "/api/auth/login"]

// Pages/APIs that require an authenticated session.
// Everything not listed above + not matching these prefixes is treated as public.
const PROTECTED_PREFIXES = ["/tools", "/api/confirm-show", "/api/auth/logout", "/api/auth/status"]

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Static/internal always passes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|gif)$/)
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const valid = await verifySession(token)

  // Authenticated users hitting `/login` go straight to the tools hub
  if (valid && pathname === "/login") {
    return NextResponse.redirect(new URL("/tools", request.url))
  }

  // Public paths — no auth required
  if (PUBLIC_PATHS.includes(pathname) || !isProtected(pathname)) {
    return NextResponse.next()
  }

  // Protected path — require a valid session
  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
