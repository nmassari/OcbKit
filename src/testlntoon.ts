import { OcbClient } from "./client.js";
// import { NwcClient } from "nwckit"

async function run() {
  const ocb = new OcbClient({
    baseUrl: "https://ocb.easycryptosend.it",
    apiKey: "YOUR_API_KEY",
  })

  const created = await ocb.withdrawLightningToOnchain({
    amountSats: 50000,
    destinationAddress: "bc1q...",
  })

  console.log("Swap created:", created.swapId)
  console.log("Invoice to pay:", created.invoice)

  // Qui pagherai invoice con NwcKit
  // await nwc.payInvoice({ invoice: created.invoice })

  const finalOp = await ocb.waitForFinalStatus(created.swapId, {
    intervalMs: 5000,
    timeoutMs: 10 * 60 * 1000,
    refreshEachPoll: true,
  })

  console.log("Final status:", finalOp.status)
}