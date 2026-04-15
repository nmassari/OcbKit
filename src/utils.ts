import { OcbAbortError } from "./errors"

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "")
}

export function joinUrl(baseUrl: string, path: string): string {
  const normalized = normalizeBaseUrl(baseUrl)
  const safePath = path.startsWith("/") ? path : `/${path}`
  return `${normalized}${safePath}`
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new OcbAbortError())
      return
    }

    const timeout = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)

    const onAbort = () => {
      clearTimeout(timeout)
      cleanup()
      reject(new OcbAbortError())
    }

    const cleanup = () => {
      if (signal) {
        signal.removeEventListener("abort", onAbort)
      }
    }

    if (signal) {
      signal.addEventListener("abort", onAbort, { once: true })
    }
  })
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function extractErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === "string" && body.trim().length > 0) {
    return body
  }

  if (isPlainObject(body)) {
    const candidates = ["message", "error", "title", "detail"]

    for (const key of candidates) {
      const value = body[key]
      if (typeof value === "string" && value.trim().length > 0) {
        return value
      }
    }
  }

  return fallback
}

export function normalizeStatus(status: string | null | undefined): string {
  return (status ?? "").trim().toLowerCase()
}

export function isFinalStatus(status: string | null | undefined): boolean {
  const s = normalizeStatus(status)
  return s === "completed" || s === "failed" || s === "expired" || s === "refunded"
}

export function isSuccessStatus(status: string | null | undefined): boolean {
  return normalizeStatus(status) === "completed"
}