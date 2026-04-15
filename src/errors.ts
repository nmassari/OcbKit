export class OcbApiError extends Error {
  public readonly statusCode: number
  public readonly body?: unknown

  constructor(message: string, statusCode: number, body?: unknown) {
    super(message)
    this.name = "OcbApiError"
    this.statusCode = statusCode
    this.body = body
  }
}

export class OcbTimeoutError extends Error {
  constructor(message = "Timed out while waiting for final swap status") {
    super(message)
    this.name = "OcbTimeoutError"
  }
}

export class OcbAbortError extends Error {
  constructor(message = "Operation aborted") {
    super(message)
    this.name = "OcbAbortError"
  }
}