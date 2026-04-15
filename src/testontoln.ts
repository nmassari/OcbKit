import { isSuccessStatus } from "./utils.js";
import { OcbClient } from "./client.js";

async function run() {
  const ocb = new OcbClient({
    baseUrl: "https://ocb.easycryptosend.it",
    apiKey: "YOUR_API_KEY",
  })

  const created = await ocb.fundLightningFromOnchain({
    amountSats: 50000,
    invoice: "lnbc...",
  })

  console.log("Swap created:", created.swapId)
  console.log("Deposit address:", created.depositAddress)
  console.log("BIP21:", created.bip21)

  const finalOp = await ocb.waitForFinalStatus(created.swapId, {
    intervalMs: 5000,
    timeoutMs: 10 * 60 * 1000,
    refreshEachPoll: true,
  })

  console.log("Final status:", finalOp.status)

  if (isSuccessStatus(finalOp.status)) {
    console.log("Swap completed")
  } else {
    console.log("Swap ended without success")
  }
}