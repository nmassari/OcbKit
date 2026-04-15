# OcbKit

**OcbKit** is a TypeScript client library for interacting with the **OnchainBridge API**, enabling seamless swaps between **Bitcoin on-chain** and the **Lightning Network**.

It provides a simple and developer-friendly interface to:

* Convert on-chain BTC → Lightning payments
* Convert Lightning payments → on-chain BTC
* Track swap status in real time

---

## 🚀 Features

* ⚡ On-chain → Lightning (submarine swaps)
* 🔄 Lightning → on-chain (reverse swaps)
* 🔑 API key authentication
* 🔁 Built-in polling for swap completion
* 🧠 Smart status handling (completed, failed, expired, refunded)
* 🌐 Works in both Node.js and browser environments

---

## 📦 Installation

```bash
npm install ocbkit
```

---

## 🔧 Configuration

```ts
import { OcbClient } from "ocbkit"

const ocb = new OcbClient({
  baseUrl: "https://ocb.easycryptosend.it",
  apiKey: "YOUR_API_KEY"
})
```

---

## ⚡ On-chain → Lightning

```ts
const swap = await ocb.fundLightningFromOnchain({
  amountSats: 50000,
  invoice: "lnbc..."
})

console.log("Send BTC to:", swap.depositAddress)
console.log("BIP21:", swap.bip21)

const result = await ocb.waitForFinalStatus(swap.swapId)

console.log("Final status:", result.status)
```

---

## 🔄 Lightning → On-chain

```ts
const swap = await ocb.withdrawLightningToOnchain({
  amountSats: 50000,
  destinationAddress: "bc1q..."
})

console.log("Pay this invoice:", swap.invoice)

// Pay with your Lightning wallet (e.g. NWC)

const result = await ocb.waitForFinalStatus(swap.swapId)

console.log("Final status:", result.status)
```

---

## 🔁 Polling swap status

```ts
const result = await ocb.waitForFinalStatus(swapId, {
  intervalMs: 5000,
  timeoutMs: 600000,
  refreshEachPoll: true
})
```

---

## 📡 API Overview

OcbKit wraps the following endpoints:

* `POST /api/bridge/fund-lightning-from-onchain`
* `POST /api/bridge/withdraw-lightning-to-onchain`
* `GET /api/bridge/operations/{swapId}`
* `POST /api/bridge/operations/{swapId}/refresh`

---

## 🧩 Related Projects

* **NwcKit** → Lightning payments via Nostr Wallet Connect
* **OnchainBridge** → backend swap service powered by Boltz

---

## ⚠️ Notes

* Minimum amount for on-chain → Lightning is **25000 sats**
* Lightning → on-chain requires a valid Bitcoin address
* Swap status may require refresh or polling

---

## 📄 License

MIT

---

## 👨‍💻 Author

Nicola Massari
