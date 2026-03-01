# ZenLend — Private Bitcoin Lending on Starknet

**🏆 Re{define} Hackathon 2026 — Privacy Track & Bitcoin Track**

The first **privacy-preserving** Bitcoin lending protocol on Starknet, purpose-built for the **strkBTC era**. Starknet's newly launched strkBTC brings Zcash-like privacy to Bitcoin — ZenLend is the lending protocol built to unlock it.

---

## 🎥 Demo Video

**[Watch the full demo on Loom](https://www.loom.com/share/c61eabd2d50544209c00befb04f35098)** (8 min) — live Pedersen commitment generation, PUSD minting, position health monitor, and on-chain contract verification on Voyager.

---

## 🟢 Deployed Contracts — Starknet Sepolia

| Contract              | Address                                                             | Explorer                                                                                                             |
| --------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **PrivateUSD (PUSD)** | `0xa023bb6fda7d2753e8c6806b889c8b9a37b3c41784997bf24c6f2202cc9611`  | [Voyager](https://sepolia.voyager.online/contract/0xa023bb6fda7d2753e8c6806b889c8b9a37b3c41784997bf24c6f2202cc9611)  |
| **PrivateBTCLending** | `0x6cd464fd97a0a48e203fff57bb4e550f50d92bd2903538dd639ed924f1635c8` | [Voyager](https://sepolia.voyager.online/contract/0x6cd464fd97a0a48e203fff57bb4e550f50d92bd2903538dd639ed924f1635c8) |

**Network:** Starknet Sepolia — RPC: `https://api.cartridge.gg/x/starknet/sepolia`
**Deployer:** `0x02e534bcc1dabcd6daef55ab7a30c5ee953d4db2853d6a3613dc7b1b4d6ae4c7`

---

## The Problem

Bitcoin DeFi has a fundamental privacy gap. Every lending protocol today exposes your collateral amount, borrow size, and health factor to anyone with a block explorer. When strkBTC launched — bringing Zcash-like shielded balances to Bitcoin on Starknet — it solved privacy at the asset layer. But no lending protocol existed that could actually use it privately. Depositing strkBTC into any current protocol immediately re-exposes everything it was designed to hide.

## What We Built

ZenLend is the first privacy-preserving Bitcoin lending protocol on Starknet, purpose-built for the strkBTC era.

Borrowers deposit strkBTC as collateral and mint PUSD — a private stablecoin — against it. The key difference: **the collateral amount is never stored on-chain in plain text.** Instead, we store a Pedersen commitment hash. On-chain, all anyone sees is `0x7bec6079bc6a27d...` — the actual BTC amount is cryptographically hidden.

This is not obscurity. It is the same Pedersen hash primitive that strkBTC itself is built on. We are composing existing trusted cryptography, not inventing new primitives.

strkBTC gives Bitcoin **asset-level privacy** (shielded balances, confidential transfers).
ZenLend adds **protocol-level privacy** (hidden collateral, ZK-verified lending).

```
strkBTC  -- shielded balances / confidential transfers
    |
ZenLend  -- hidden collateral / ZK-verified borrowing
    |
PUSD     -- private stablecoin output
```

Privacy is the institutional priority for 2026. Institutions will not use DeFi if their trading positions, collateral sizes, and borrowing strategies are visible to competitors. ZenLend provides the infrastructure layer that makes private Bitcoin DeFi viable on Starknet.

---

## Core Features

| Feature                  | Description                                                              |
| ------------------------ | ------------------------------------------------------------------------ |
| **strkBTC Collateral**   | Deposit Bitcoin without revealing amounts on-chain                       |
| **Pedersen Commitments** | Same cryptographic primitives used by strkBTC itself                     |
| **ZK Proof Generation**  | Flask backend generates proofs; Cairo verifies on-chain                  |
| **PUSD Minting**         | Borrow stablecoins instantly against private collateral (150% min ratio) |
| **Health Monitoring**    | Real-time position health with live BTC price feed                       |
| **Viewing Key Design**   | Audit-friendly compliance model matching strkBTC                         |

---

## Competitive Positioning

| Feature         | StarkStorm                        | ZenLend                         |
| --------------- | --------------------------------- | ------------------------------- |
| Privacy         | No — all amounts visible          | Yes — zero-knowledge hidden     |
| strkBTC support | No — not designed for private BTC | Yes — purpose-built for strkBTC |
| Lending model   | P2P coordination                  | Protocol-based instant lending  |
| Compliance      | —                                 | Yes — viewing key compatible    |
| Pricing         | Static                            | Yes — live CoinGecko BTC feed   |

---

## Architecture

**1. ZK Commitment Layer (Python/Flask)**
A local backend generates Pedersen commitments from the user collateral amount and a private key. This runs on the user machine — no amount data leaves their control. The commitment hash is what gets submitted to the contract.

**2. Cairo Smart Contracts (Starknet)**
`private_btc_lending.cairo` stores commitments, tracks debt, and enables ZK-range-proof-based liquidation — verifying that collateral >= debt x 150% without ever revealing the actual numbers. `private_usd.cairo` is the PUSD ERC-20 stablecoin.

**3. React Frontend**
A real-time dashboard with live BTC price from CoinGecko, position health monitoring, a collateral deposit flow that calls the commitment API and displays the proof hash, and a full repay/add-collateral interface.

```
Browser (React 18)
  -- Header             sticky nav / live BTC price / wallet connect
  -- ProtocolStats      4 live stat cards (collateral / PUSD / ratio / positions)
  -- WalletSection      hero landing (shown when disconnected)
  -- DepositCollateral  strkBTC input -> ZK commitment API -> proof badge
  -- MintPUSD           PUSD amount -> live collateral preview -> mint
  -- UserPosition       health bar / liquidation price / ratio / actions

Flask API  (localhost:5000)
  -- POST /generate-commitment   Pedersen commitment + nonce + verification data
  -- GET  /health

Cairo Contracts  (Starknet Sepolia -- live)
  -- PrivateUSD        0xa023bb6fda7d2753e8c6806b889c8b9a37b3c41784997bf24c6f2202cc9611
  -- PrivateBTCLending 0x6cd464fd97a0a48e203fff57bb4e550f50d92bd2903538dd639ed924f1635c8
```

---

## Cairo Contract Interface

```rust
fn deposit_collateral(commitment: felt252, proof_r: felt252, proof_s: felt252, amount_hint: u128)
fn withdraw_collateral(amount: u128, opening_proof: Array<felt252>)
fn mint_stable(amount: u128, collateral_proof: Array<felt252>)
fn repay_debt(amount: u128)
fn liquidate_position(borrower: ContractAddress)
```

---

## ZK Proof Example

```bash
curl -X POST http://localhost:5000/generate-commitment \
  -H "Content-Type: application/json" \
  -d '{"amount": 1.5, "private_key": "your_secret"}'

# Response:
# {
#   "commitment": "0x7bec6079bc6a27d...",
#   "proof": { "commitment_type": "pedersen", "nonce": "0xfc9f310b..." },
#   "success": true
# }
```

---

## Quick Start

```bash
# 1 -- Install backend dependencies
cd commitments && pip install -r requirements.txt

# 2 -- Start ZK proof API (port 5000)
python app.py

# 3 -- Install and start frontend (port 3000)
cd ../frontend && npm install && npm start
```

Or use the one-click scripts:

```bash
start-demo.bat          # Windows
./start-demo.sh         # Linux / Mac
```

Verify both are running:

- `http://localhost:5000/health` -> `{ "status": "healthy" }`
- `http://localhost:3000` -> Landing page loads

---

## Deploy to Vercel

Both the Flask backend and React frontend can be deployed as separate Vercel projects.

### 1 — Deploy the Backend (Flask API)

```bash
cd commitments
vercel deploy
```

After deployment note the URL (e.g. `https://zenlend-api.vercel.app`).

> **Note:** `starknet-py` is a large dependency (~150 MB). If Vercel's 250 MB Lambda limit is hit, remove it from `requirements.txt` — it is only used for optional contract integration helpers, not the commitment API itself.

### 2 — Deploy the Frontend (React)

```bash
cd frontend
vercel deploy
```

Set the environment variable in the Vercel dashboard (or via CLI) before deploying:

```bash
vercel env add REACT_APP_API_URL
# Enter your backend URL, e.g: https://zenlend-api.vercel.app
```

Then redeploy after setting the env var:

```bash
vercel deploy --prod
```

### Environment Variables

| Project  | Variable            | Value                               |
| -------- | ------------------- | ----------------------------------- |
| Frontend | `REACT_APP_API_URL` | `https://<your-backend>.vercel.app` |

For local dev, copy `frontend/.env.example` to `frontend/.env.local` and set `REACT_APP_API_URL=http://localhost:5000`.

---

## Demo Flow

1. **Landing page** — Hero section with strkBTC feature highlights
2. **Connect wallet** — Demo mode (instant) or Production mode (Argent X / Braavos + live Sepolia contracts)
3. **Protocol stats** — Live dashboard: total strkBTC collateral, PUSD minted, collateral ratio, active positions
4. **Deposit strkBTC** — Enter amount + private key -> Flask backend generates Pedersen commitment -> proof hash displayed on-screen
5. **Mint PUSD** — Enter borrow amount -> live collateral requirement preview at current BTC price -> mint
6. **Position monitor** — Health factor bar, liquidation price, collateral ratio — all real time; repay or add collateral in one click

---

## Judge Q&A

| Question                                                      | Answer                                                                                                                                                     |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **"Is the ZK proof real?"**                                   | Yes. Pedersen hash runs in the Flask backend — real cryptographic computation, not mocked. Visible in Chrome DevTools Network tab during the deposit step. |
| **"Why not just use strkBTC directly for lending?"**          | strkBTC hides wallet balances. ZenLend hides lending positions — collateral amount is invisible even to the protocol and on-chain observers.               |
| **"How does liquidation work if the amount is hidden?"**      | The Cairo contract uses a ZK range proof to verify collateral >= debt x 1.5 without revealing the actual number. The commitment scheme allows this.        |
| **"Is this deployed on Starknet?"**                           | Yes — both contracts are live on Starknet Sepolia. PUSD: 0xa023bb6...c9611, PrivateBTCLending: 0x6cd464...635c8. Verify at sepolia.voyager.online.         |
| **"What's the BTC price source?"**                            | Live CoinGecko API, updating every 30 seconds. Visible in the navbar right now.                                                                            |
| **"How is the private key handled?"**                         | Goes only to your local Flask server on port 5000 — never touches an external server. In production it would be handled entirely client-side.              |
| **"What makes this different from other lending protocols?"** | Every other Starknet lending protocol exposes all position data on-chain. ZenLend is cryptographically private by design, not by trust.                    |

---

## Emergency Fixes

**Flask backend not running:**

```bash
cd commitments && python app.py
```

**Deposit shows "Failed to generate ZK proof":** Flask is down — restart with command above.

**Frontend not loading:**

```bash
cd frontend && npm start
```

**BTC price showing fallback ($67,450):** CoinGecko rate limit hit — price resumes on next 30s tick.

**Position not showing after connect:** Refresh the page — position auto-loads on wallet connect.

---

## Hackathon Tracks

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

## Project Structure

```
zenlend/
├── contracts/
│   ├── private_btc_lending.cairo   # Main lending protocol (ZK-enabled)
│   └── private_usd.cairo           # PUSD stablecoin
├── commitments/
│   ├── app.py                      # Flask API server
│   ├── pedersen.py                 # Pedersen commitment generation
│   ├── integration.py              # Cairo contract integration helpers
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/             # Header / WalletSection / ProtocolStats
│   │   │                           # DepositCollateral / MintPUSD / UserPosition
│   │   ├── hooks/                  # useWallet / useProtocol
│   │   └── services/               # priceService (CoinGecko)
│   └── package.json
├── Scarb.toml                       # Cairo build config
├── deploy.html                      # Browser-based Starknet deployment UI (Braavos)
├── start-demo.bat / start-demo.sh   # One-click demo launchers
└── README.md
```

---

**GitHub:** https://github.com/ashitosh07/ZenLend
**Starknet Wallet:** `0x02e534bcc1dabcd6daef55ab7a30c5ee953d4db2853d6a3613dc7b1b4d6ae4c7`

_ZenLend — Built for Re{define} Hackathon 2026. Starknet's private Bitcoin era starts now._
