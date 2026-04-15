# OcbKit

[![npm](https://img.shields.io/npm/v/@nmassari/ocbkit)](https://www.npmjs.com/package/@nmassari/ocbkit)
[![license](https://img.shields.io/npm/l/@nmassari/ocbkit)](https://github.com/nmassari/ocbkit/blob/main/LICENSE)

**OcbKit** is a TypeScript client for the **OnchainBridge API**, enabling seamless swaps between **Bitcoin on-chain** and the **Lightning Network**.

It is designed to be simple, reliable, and production-ready.

---

## ⚡ What you can do

* 🔄 Convert **on-chain BTC → Lightning payments**
* ⚡ Convert **Lightning → on-chain BTC**
* 🔁 Track swaps in real time
* 🔑 Use API keys with rate-limited backend
* 🧠 Handle swap lifecycle (pending → completed / failed)

---

## 🧩 Architecture

OcbKit is part of a modular stack:

* **OcbKit** → swap client (this library)
* **OnchainBridge** → backend swap service (powered by Boltz)
* **NwcKit** → Lightning payments via Nostr Wallet Connect

Typical flow:

```text
User → NwcKit (wallet)
     → OcbKit (swap request)
     → OnchainBridge (Boltz)
     → Bitcoin / Lightning
```

---

## 📦 Installation

```bash
npm install @nmassari/ocbkit
```

---

## 🔧 Setup

```ts
import { OcbClient } from "@nmassari/ocbkit"

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

console.log("Deposit address:", swap.depositAddress)
console.log("BIP21:", swap.bip21)

// wait completion
const result = await ocb.waitForFinalStatus(swap.swapId)

console.log("Final status:", result.status)
```

👉 The user must send BTC to the returned address.

---

## 🔄 Lightning → On-chain

```ts
const swap = await ocb.withdrawLightningToOnchain({
  amountSats: 50000,
  destinationAddress: "bc1q..."
})

console.log("Pay this invoice:", swap.invoice)

// pay invoice using your wallet (e.g. NwcKit)

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

## 📡 API Coverage

OcbKit wraps the following endpoints:

* `POST /api/bridge/fund-lightning-from-onchain`
* `POST /api/bridge/withdraw-lightning-to-onchain`
* `GET /api/bridge/operations/{swapId}`
* `POST /api/bridge/operations/{swapId}/refresh`

---

## ⚠️ Important notes

* Minimum amount for on-chain → Lightning: **25,000 sats**
* Lightning → on-chain requires a valid Bitcoin address
* Swap status may require refresh or polling
* Final states include: `completed`, `failed`, `expired`, `refunded`

---

## 🧪 Example: Full flow (with Lightning wallet)

```ts
// 1. create swap
const swap = await ocb.withdrawLightningToOnchain({
  amountSats: 50000,
  destinationAddress: "bc1q..."
})

// 2. pay invoice via NwcKit (or other LN wallet)
// await nwc.payInvoice({ invoice: swap.invoice })

// 3. wait completion
const result = await ocb.waitForFinalStatus(swap.swapId)

if (result.status === "completed") {
  console.log("BTC received on-chain")
}
```

---

## 📄 License

ISC

---

## 👨‍💻 Author

Nicola Massari
