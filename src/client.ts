import { OcbApiError } from "./errors"
import {
  FundLightningFromOnchainRequest,
  FundLightningFromOnchainResponse,
  OcbClientConfig,
  OcbHealthResponse,
  RefreshSwapResponse,
  SwapOperationStatusResponse,
  WaitForFinalStatusOptions,
  WithdrawLightningToOnchainRequest,
  WithdrawLightningToOnchainResponse,
} from "./types"
import { extractErrorMessage, isFinalStatus, joinUrl, sleep } from "./utils"

export class OcbClient {
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly fetchImpl: typeof fetch

  constructor(config: OcbClientConfig) {
    if (!config?.baseUrl?.trim()) {
      throw new Error("OcbClient: baseUrl is required")
    }

    if (!config?.apiKey?.trim()) {
      throw new Error("OcbClient: apiKey is required")
    }

    const fetchImpl = config.fetch ?? globalThis.fetch

    if (!fetchImpl) {
      throw new Error("OcbClient: fetch implementation not available")
    }

    this.baseUrl = config.baseUrl
    this.apiKey = config.apiKey
    this.fetchImpl = fetchImpl
  }

  async health(signal?: AbortSignal): Promise<OcbHealthResponse> {
    return await this.requestJson<OcbHealthResponse>("GET", "/api/bridge/health", undefined, signal)
  }

  async fundLightningFromOnchain(
    request: FundLightningFromOnchainRequest,
    signal?: AbortSignal
  ): Promise<FundLightningFromOnchainResponse> {
    this.validateFundLightningFromOnchainRequest(request)

    return await this.requestJson<FundLightningFromOnchainResponse>(
      "POST",
      "/api/bridge/fund-lightning-from-onchain",
      {
        amountSats: request.amountSats,
        invoice: request.invoice,
      },
      signal
    )
  }

  async withdrawLightningToOnchain(
    request: WithdrawLightningToOnchainRequest,
    signal?: AbortSignal
  ): Promise<WithdrawLightningToOnchainResponse> {
    this.validateWithdrawLightningToOnchainRequest(request)

    return await this.requestJson<WithdrawLightningToOnchainResponse>(
      "POST",
      "/api/bridge/withdraw-lightning-to-onchain",
      {
        amountSats: request.amountSats,
        destinationAddress: request.destinationAddress,
      },
      signal
    )
  }

  async getOperation(
    swapId: string,
    signal?: AbortSignal
  ): Promise<SwapOperationStatusResponse> {
    if (!swapId?.trim()) {
      throw new Error("swapId is required")
    }

    return await this.requestJson<SwapOperationStatusResponse>(
      "GET",
      `/api/bridge/operations/${encodeURIComponent(swapId)}`,
      undefined,
      signal
    )
  }

  async refreshOperation(
    swapId: string,
    signal?: AbortSignal
  ): Promise<RefreshSwapResponse> {
    if (!swapId?.trim()) {
      throw new Error("swapId is required")
    }

    return await this.requestJson<RefreshSwapResponse>(
      "POST",
      `/api/bridge/operations/${encodeURIComponent(swapId)}/refresh`,
      {},
      signal
    )
  }

  async waitForFinalStatus(
    swapId: string,
    options?: WaitForFinalStatusOptions
  ): Promise<SwapOperationStatusResponse> {
    if (!swapId?.trim()) {
      throw new Error("swapId is required")
    }

    const intervalMs = Math.max(1000, options?.intervalMs ?? 5000)
    const timeoutMs = Math.max(1000, options?.timeoutMs ?? 5 * 60 * 1000)
    const refreshEachPoll = options?.refreshEachPoll ?? true
    const signal = options?.signal

    const startedAt = Date.now()

    while (true) {
      if (signal?.aborted) {
        throw new DOMException("Operation aborted", "AbortError")
      }

      if (Date.now() - startedAt > timeoutMs) {
        throw new Error(`Timed out waiting for final status for swap ${swapId}`)
      }

      if (refreshEachPoll) {
        try {
          await this.refreshOperation(swapId, signal)
        } catch (error) {
          if (error instanceof OcbApiError && error.statusCode === 404) {
            throw error
          }
        }
      }

      const operation = await this.getOperation(swapId, signal)

      if (isFinalStatus(operation.status)) {
        return operation
      }

      await sleep(intervalMs, signal)
    }
  }

  private async requestJson<T>(
    method: string,
    path: string,
    body?: unknown,
    signal?: AbortSignal
  ): Promise<T> {
    const response = await this.fetchImpl(joinUrl(this.baseUrl, path), {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": this.apiKey,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })

    const rawText = await response.text()
    const parsed = this.tryParseJson(rawText)

    if (!response.ok) {
      const fallback = `HTTP ${response.status} ${response.statusText}`.trim()
      const message = extractErrorMessage(parsed ?? rawText, fallback)
      throw new OcbApiError(message, response.status, parsed ?? rawText)
    }

    return (parsed ?? ({} as T)) as T
  }

  private tryParseJson(text: string): unknown | undefined {
    if (!text || !text.trim()) {
      return undefined
    }

    try {
      return JSON.parse(text)
    } catch {
      return undefined
    }
  }

  private validateFundLightningFromOnchainRequest(
    request: FundLightningFromOnchainRequest
  ): void {
    if (!request) {
      throw new Error("request is required")
    }

    if (!Number.isFinite(request.amountSats) || request.amountSats < 25000) {
      throw new Error("amountSats must be >= 25000")
    }

    if (!request.invoice?.trim()) {
      throw new Error("invoice is required")
    }
  }

  private validateWithdrawLightningToOnchainRequest(
    request: WithdrawLightningToOnchainRequest
  ): void {
    if (!request) {
      throw new Error("request is required")
    }

    if (!Number.isFinite(request.amountSats) || request.amountSats <= 0) {
      throw new Error("amountSats must be > 0")
    }

    if (!request.destinationAddress?.trim()) {
      throw new Error("destinationAddress is required")
    }
  }
}