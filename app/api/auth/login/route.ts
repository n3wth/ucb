import { NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"
import { signSession, constantTimeEqual, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session"

export async function POST(request: NextRequest) {
  const expected = env.UCB_APP_PASSWORD

  let password = ""
  try {
    const body = await request.json()
    password = typeof body?.password === "string" ? body.password : ""
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!password || !constantTimeEqual(password, expected)) {
    // Small delay to blunt brute-force attempts
    await new Promise((r) => setTimeout(r, 350))
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
  }

  const token = await signSession(SESSION_MAX_AGE)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
  return res
}
