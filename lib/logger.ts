// Structured logger that prefixes every line with [v0] so Vercel's log
// pipeline can be filtered cleanly. Use scoped loggers per feature.
//
//   const log = createLogger("drive")
//   log.info("creating folder", { name })     -> "[v0] drive: creating folder { name: '...' }"
//   log.error("create failed", err)           -> "[v0] drive: create failed { ...error shape... }"

export interface Logger {
  info: (message: string, data?: unknown) => void
  warn: (message: string, data?: unknown) => void
  error: (message: string, data?: unknown) => void
  child: (subScope: string) => Logger
}

function safeData(data: unknown): unknown {
  if (data == null) return undefined
  // Normalize errors / Axios-style responses into plain objects so they
  // actually print in Vercel logs instead of showing up as "{}".
  if (data instanceof Error) {
    const anyErr = data as any
    return {
      name: anyErr.name,
      message: anyErr.message,
      code: anyErr.code,
      status: anyErr?.response?.status,
      data: anyErr?.response?.data ?? anyErr?.errors,
    }
  }
  if (typeof data === "object" && data && "response" in (data as any)) {
    const anyErr = data as any
    return {
      status: anyErr?.response?.status,
      data: anyErr?.response?.data,
      message: anyErr?.message,
    }
  }
  return data
}

export function createLogger(scope: string): Logger {
  const emit = (level: "info" | "warn" | "error", message: string, data?: unknown) => {
    const prefix = `[v0] ${scope}:`
    const payload = safeData(data)
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log
    if (payload === undefined) {
      fn(prefix, message)
    } else {
      fn(prefix, message, payload)
    }
  }
  return {
    info: (message, data) => emit("info", message, data),
    warn: (message, data) => emit("warn", message, data),
    error: (message, data) => emit("error", message, data),
    child: (subScope: string) => createLogger(`${scope}:${subScope}`),
  }
}

// Short, human-readable error description for surfacing to clients.
export function describeError(err: unknown): string {
  const anyErr = err as any
  const payload = anyErr?.response?.data?.error?.message || anyErr?.response?.data || anyErr?.errors
  if (payload) {
    return typeof payload === "string" ? payload : JSON.stringify(payload)
  }
  if (anyErr?.message) return String(anyErr.message)
  return String(err)
}
