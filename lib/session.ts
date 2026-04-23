// Edge-compatible HMAC-signed session cookies using Web Crypto.
// Format: base64url(payload) + "." + base64url(HMAC-SHA256(payload))

import { env } from "./env"

const COOKIE_NAME = "ucb_session"
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

function getSecret(): string {
  return env.SESSION_SECRET
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))
  return base64UrlEncode(new Uint8Array(sig))
}

interface SessionPayload {
  exp: number // unix seconds
  v: 1
}

export async function signSession(maxAgeSeconds: number = DEFAULT_MAX_AGE_SECONDS): Promise<string> {
  const payload: SessionPayload = {
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
    v: 1,
  }
  const payloadStr = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)))
  const sig = await hmac(payloadStr)
  return `${payloadStr}.${sig}`
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const parts = token.split(".")
  if (parts.length !== 2) return false
  const [payloadStr, sig] = parts

  const expected = await hmac(payloadStr)
  // Constant-time compare
  if (expected.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  }
  if (diff !== 0) return false

  try {
    const json = new TextDecoder().decode(base64UrlDecode(payloadStr))
    const payload = JSON.parse(json) as SessionPayload
    if (payload.v !== 1) return false
    if (typeof payload.exp !== "number") return false
    if (payload.exp < Math.floor(Date.now() / 1000)) return false
    return true
  } catch {
    return false
  }
}

export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export const SESSION_COOKIE = COOKIE_NAME
export const SESSION_MAX_AGE = DEFAULT_MAX_AGE_SECONDS
