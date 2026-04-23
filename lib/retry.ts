import { createLogger } from "./logger"

const log = createLogger("retry")

export interface RetryOptions {
  retries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  label?: string
}

// Retriable = 429 (rate limit), 500, 502, 503, 504 (transient server)
function isRetriable(err: any): boolean {
  const status: number | undefined = err?.response?.status ?? err?.code
  if (!status) return false
  return status === 429 || (status >= 500 && status <= 599)
}

function getRetryAfterMs(err: any): number | null {
  const header =
    err?.response?.headers?.["retry-after"] ??
    err?.response?.headers?.get?.("retry-after")
  if (!header) return null
  const asNum = Number(header)
  if (!Number.isNaN(asNum)) return asNum * 1000
  const asDate = Date.parse(header)
  if (!Number.isNaN(asDate)) return Math.max(0, asDate - Date.now())
  return null
}

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const retries = opts.retries ?? 3
  const baseDelay = opts.baseDelayMs ?? 500
  const maxDelay = opts.maxDelayMs ?? 8000
  const label = opts.label ?? "op"

  let lastErr: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      lastErr = err
      const status = err?.response?.status
      const retriable = isRetriable(err)
      if (!retriable || attempt === retries) {
        log.error(`${label} failed (no more retries)`, { attempt, status, retriable })
        throw err
      }
      const retryAfter = getRetryAfterMs(err)
      const jitter = Math.floor(Math.random() * 250)
      const backoff = Math.min(maxDelay, baseDelay * 2 ** attempt) + jitter
      const wait = retryAfter ?? backoff
      log.warn(`${label} retrying`, { attempt: attempt + 1, of: retries, waitMs: wait, status })
      await new Promise((r) => setTimeout(r, wait))
    }
  }
  // Unreachable but keeps TS happy
  throw lastErr
}
