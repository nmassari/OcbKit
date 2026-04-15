export interface OcbClientConfig {
  baseUrl: string
  apiKey: string
  fetch?: typeof fetch
}

export interface OcbHealthResponse {
  ok: boolean
  service: string
  utc: string
}

export interface OcbErrorResponse {
  error?: string
  message?: string
  title?: string
  detail?: string
  status?: number
}

export interface FundLightningFromOnchainRequest {
  amountSats: number
  invoice: string
}

export interface WithdrawLightningToOnchainRequest {
  amountSats: number
  destinationAddress: string
}

export interface FundLightningFromOnchainResponse {
  ok: boolean
  operationId: string
  swapId: string
  direction: string
  status: string
  depositAddress: string
  bip21?: string | null
  expectedAmount?: number | null
  timeoutBlockHeight?: number | null
}

export interface WithdrawLightningToOnchainResponse {
  ok: boolean
  operationId: string
  swapId: string
  direction: string
  status: string
  invoice: string
  lockupAddress?: string | null
  timeoutBlockHeight?: number | null
}

export interface SwapOperationStatusResponse {
  operationId: string
  swapId: string
  type: string
  direction: string
  status: string
  boltzStatus?: string | null
  amountSats: number
  expectedAmount?: number | null
  depositAddress?: string | null
  lockupAddress?: string | null
  timeoutBlockHeight?: number | null
  createdUtc: string
  updatedUtc: string
  lastCheckedUtc?: string | null
  completedUtc?: string | null
}

export interface RefreshSwapResponse {
  ok: boolean
  swapId: string
  status: string
  boltzStatus?: string | null
  updatedUtc: string
}

export interface WaitForFinalStatusOptions {
  intervalMs?: number
  timeoutMs?: number
  refreshEachPoll?: boolean
  signal?: AbortSignal
}