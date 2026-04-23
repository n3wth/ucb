// Per-key sliding-window rate limiter backed by a capped in-memory Map.
//
// Two windows enforced together: short (burst) + long (hourly).
// A request is allowed only when BOTH windows have capacity.
//
// Process-local only. On Fluid Compute instances are reused across concurrent
// requests, so this is effective for the single-tenant scale documented in
// ucb-5xc. Not suitable for multi-region or horizontally-scaled deployments.

export interface RateLimitRule {
  windowMs: number
  max: number
}

export interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
  remaining: number
  limit: number
}

interface Bucket {
  // Timestamps (ms) of recent hits, oldest first.
  hits: number[]
}

export interface RateLimiterOptions {
  rules: RateLimitRule[]
  maxKeys?: number
  now?: () => number
}

const DEFAULT_MAX_KEYS = 5000

export class RateLimiter {
  private readonly rules: RateLimitRule[]
  private readonly maxKeys: number
  private readonly now: () => number
  private readonly store = new Map<string, Bucket>()

  constructor(opts: RateLimiterOptions) {
    if (opts.rules.length === 0) throw new Error("rate limiter requires at least one rule")
    this.rules = [...opts.rules].sort((a, b) => b.windowMs - a.windowMs)
    this.maxKeys = opts.maxKeys ?? DEFAULT_MAX_KEYS
    this.now = opts.now ?? (() => Date.now())
  }

  check(key: string): RateLimitResult {
    const now = this.now()
    const longestWindow = this.rules[0].windowMs

    let bucket = this.store.get(key)
    if (!bucket) {
      bucket = { hits: [] }
    } else {
      // Refresh LRU position.
      this.store.delete(key)
    }

    // Drop hits outside the longest window.
    const cutoff = now - longestWindow
    if (bucket.hits.length > 0 && bucket.hits[0] <= cutoff) {
      bucket.hits = bucket.hits.filter((t) => t > cutoff)
    }

    let worstRetry = 0
    let tightestRemaining = Number.POSITIVE_INFINITY
    let tightestLimit = 0

    for (const rule of this.rules) {
      const windowStart = now - rule.windowMs
      const countInWindow = bucket.hits.reduce((n, t) => (t > windowStart ? n + 1 : n), 0)
      const remaining = Math.max(0, rule.max - countInWindow)
      if (remaining < tightestRemaining) {
        tightestRemaining = remaining
        tightestLimit = rule.max
      }
      if (countInWindow >= rule.max) {
        // Oldest hit still inside this window determines when capacity frees.
        const oldestInWindow = bucket.hits.find((t) => t > windowStart) ?? now
        const retry = Math.ceil((oldestInWindow + rule.windowMs - now) / 1000)
        if (retry > worstRetry) worstRetry = retry
      }
    }

    if (worstRetry > 0) {
      this.store.set(key, bucket)
      this.evictIfNeeded()
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, worstRetry),
        remaining: 0,
        limit: tightestLimit,
      }
    }

    bucket.hits.push(now)
    this.store.set(key, bucket)
    this.evictIfNeeded()

    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: Math.max(0, tightestRemaining - 1),
      limit: tightestLimit,
    }
  }

  // For tests.
  reset(): void {
    this.store.clear()
  }

  private evictIfNeeded(): void {
    while (this.store.size > this.maxKeys) {
      const oldest = this.store.keys().next().value
      if (oldest === undefined) break
      this.store.delete(oldest)
    }
  }
}

// Hash an opaque identifier (like a session cookie) to a short key so we never
// log or retain the raw token. SHA-256 truncated to 16 hex chars is plenty.
export async function hashKey(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  return hex.slice(0, 16)
}
