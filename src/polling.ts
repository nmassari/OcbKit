import { OcbClient } from "./client"
import { SwapOperationStatusResponse, WaitForFinalStatusOptions } from "./types"

export async function waitForFinalStatus(
  client: OcbClient,
  swapId: string,
  options?: WaitForFinalStatusOptions
): Promise<SwapOperationStatusResponse> {
  return await client.waitForFinalStatus(swapId, options)
}