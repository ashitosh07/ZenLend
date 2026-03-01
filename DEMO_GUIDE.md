# ZenLend — Demo Guide

**Re{define} Hackathon 2026 | Privacy Track + Bitcoin Track**

> **🟢 Contracts live on Starknet Sepolia**
> | Contract | Address |
> |---|---|
> | PrivateUSD (PUSD) | `0xa023bb6fda7d2753e8c6806b889c8b9a37b3c41784997bf24c6f2202cc9611` |
> | PrivateBTCLending | `0x6cd464fd97a0a48e203fff57bb4e550f50d92bd2903538dd639ed924f1635c8` |
>
> [PUSD on Voyager](https://sepolia.voyager.online/contract/0xa023bb6fda7d2753e8c6806b889c8b9a37b3c41784997bf24c6f2202cc9611) · [Lending on Voyager](https://sepolia.voyager.online/contract/0x6cd464fd97a0a48e203fff57bb4e550f50d92bd2903538dd639ed924f1635c8) · [🎥 Demo Video](https://www.loom.com/share/c61eabd2d50544209c00befb04f35098)

---

## Pre-Demo Setup (30 seconds)

Open **two terminals** before the judges arrive:

**Terminal 1 — ZK Proof Backend:**

```bash
cd commitments
python app.py
# ✅ Expected: Running on http://localhost:5000
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm start
# ✅ Expected: Compiled successfully on http://localhost:3000
```

Verify both are running by checking:

- `http://localhost:5000/health` → `{ "status": "healthy" }`
- `http://localhost:3000` → Landing page loads

---

## Demo Script (5 minutes)

### Step 1 — Landing Page

**What to show:** Hero section with the three feature cards.

**What to say:**

> "This is ZenLend — the first privacy-preserving Bitcoin lending protocol on Starknet, purpose-built for the strkBTC era. strkBTC gives Bitcoin asset-level privacy — shielded balances and confidential transfers. ZenLend adds protocol-level privacy on top — your collateral amount is never visible on-chain, not even to the protocol itself."

---

### Step 2 — Connect Wallet

**Action:** Click **Connect Demo Wallet** (Demo mode toggle is on by default).

**What to say:**

> "In production this connects Argent X or Braavos directly through the Starknet wallet API and interacts with our live contracts on Starknet Sepolia. For this demo we use an instant mock wallet so the flow is instant and reliable during the presentation."

Wait 1.5 seconds → dashboard appears.

---

### Step 3 — Protocol Stats

**What to show:** The 4 stat cards — Total Collateral, PUSD Minted, Collateral Ratio, Active Positions.

**What to say:**

> "These stats update in real time. The BTC price in the navbar is live from CoinGecko — it refreshes every 30 seconds and drives all the collateral ratio calculations across the entire protocol."

---

### Step 4 — Deposit Collateral ⭐ Key Moment

**Action:**

1. Enter `1.5` in the Amount field
2. Enter any text as the private key (e.g. `mysecret123`)
3. Open Chrome DevTools → Network tab
4. Click **Deposit strkBTC**

**What to say:**

> "Watch the network tab. When I click deposit, the frontend sends the amount and private key to our local Pedersen commitment generator — a Python Flask backend running on port 5000."

_[Network tab shows the `generate-commitment` request]_

> "The request goes out — and the response comes back with a commitment hash. This hash is what gets stored on-chain. The actual BTC amount? Completely hidden. Nobody — not the protocol, not the blockchain explorer, not a liquidator — can see how much collateral I locked."

_[Green proof badge appears with commitment hash `0x...`]_

> "This is the same Pedersen hash function that strkBTC itself uses. We're not inventing new cryptography — we're composing the existing primitives in a new way."

---

### Step 5 — Mint PUSD

**Action:**

1. Enter `10000` in the PUSD Amount field
2. Watch the live preview update

**What to say:**

> "The collateral preview updates instantly — it's calculating how much strkBTC you need at the current live BTC price to maintain a 150% collateral ratio. That number changes in real time as the price moves."

3. Click **Mint PUSD**

> "PUSD is our private stablecoin — backed by hidden Bitcoin collateral. The balance updates here in the card header."

---

### Step 6 — Position Monitor

**What to show:** Health factor bar, the 4 stat grid, liquidation price.

**What to say:**

> "The position monitor gives borrowers a live health readout. Green means safe, yellow is a warning, red means you're close to liquidation. The liquidation price tells you exactly at what BTC price your position gets liquidated."

**Action — Repay PUSD:**

1. Click **Repay PUSD**
2. Enter an amount (e.g. `5000`)
3. Click **Confirm Repay**

> "Watch the health bar — as I repay debt, the collateral ratio improves and the health factor moves up toward green."

**Action — Add Collateral:**
Click **Add Collateral**

> "This scrolls directly to the deposit card so you can top up your collateral in one click."

---

### Step 7 — Closing Statement

> "No existing Starknet protocol supports private Bitcoin collateral. ZenLend is the only protocol purpose-built for strkBTC — hiding collateral amounts on-chain while still enabling trustless liquidation through ZK proofs. Both contracts are live on Starknet Sepolia right now — you can verify them on Voyager. We are targeting both the Privacy Track and the Bitcoin Track, with $24,850 in combined prize potential."

---

## Judge Q&A — Quick Answers

| Question                                                      | Answer                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **"Is the ZK proof real?"**                                   | Yes. Pedersen hash runs in the Flask backend — real cryptographic computation, not mocked. You can see the raw request and response in the network tab.                                                                                                                    |
| **"Why not just use strkBTC directly for lending?"**          | strkBTC hides wallet balances. ZenLend hides lending positions — your collateral amount is invisible even to the protocol and on-chain observers.                                                                                                                          |
| **"How does liquidation work if the amount is hidden?"**      | The Cairo contract uses a ZK range proof to verify `collateral ≥ debt × 1.5` without revealing the actual number. The commitment scheme allows this.                                                                                                                       |
| **"Is this deployed on Starknet?"**                           | Yes — both contracts are live on Starknet Sepolia. PUSD: `0xa023bb6...c9611`, PrivateBTCLending: `0x6cd464...635c8`. Verify on Voyager: sepolia.voyager.online. The demo uses a local mock wallet for presentation speed but the on-chain contracts are real and callable. |
| **"What's the BTC price source?"**                            | Live CoinGecko API, updating every 30 seconds. You can see the current price and 24h change in the navbar right now.                                                                                                                                                       |
| **"How is the private key handled?"**                         | It goes only to your local Flask server on port 5000 — it never touches any external server. In production it would be handled entirely client-side in-browser.                                                                                                            |
| **"What makes this different from other lending protocols?"** | Every other Starknet lending protocol exposes all position data on-chain. ZenLend is cryptographically private by design, not by trust.                                                                                                                                    |

---

## Emergency Fixes

**Flask backend not running:**

```bash
cd commitments && python app.py
```

**Deposit shows "Failed to generate ZK proof":**
→ Flask is down. Restart with command above.

**Frontend not loading:**

```bash
cd frontend && npm start
```

**BTC price showing fallback ($67,450):**
→ CoinGecko rate limit hit. Price will resume on next 30s tick. Everything still works.

**Position not showing after connect:**
→ Refresh the page — position auto-loads on wallet connect.

---

## Two Tracks, One Protocol

### Privacy Track — $9,675 STRK

- Pedersen commitments (same cryptography as strkBTC)
- Cairo on-chain ZK proof verification
- Viewing key compatible audit design — compliance without sacrificing privacy

### Bitcoin Track — $9,675 + $5,500 in-kind

- First DeFi lending protocol purpose-built for strkBTC
- Real-time BTC price integration (CoinGecko)
- PUSD stablecoin minted against private Bitcoin collateral

**Combined prize potential: $24,850**

---

_ZenLend — Built for Re{define} Hackathon 2026. Starknet's private Bitcoin era starts now._
