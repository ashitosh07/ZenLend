# ZenLend — Private Bitcoin Lending on Starknet

**🏆 Re{define} Hackathon 2026 — Privacy Track & Bitcoin Track**

The first **privacy-preserving** Bitcoin lending protocol on Starknet, purpose-built for the **strkBTC era**. Starknet's newly launched strkBTC brings Zcash-like privacy to Bitcoin — ZenLend is the lending protocol built to unlock it.

---

## Why ZenLend

strkBTC gives Bitcoin **asset-level privacy** (shielded balances, confidential transfers).  
ZenLend adds **protocol-level privacy** (hidden collateral, ZK-verified lending).

```
strkBTC  ── shielded balances · confidential transfers
    ↕
ZenLend  ── hidden collateral · ZK-verified borrowing
    ↕
PUSD     ── private stablecoin output
```

No existing Starknet protocol supports private Bitcoin collateral. ZenLend is first.

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

## Quick Start

```bash
# 1 — Install backend dependencies
cd commitments && pip install -r requirements.txt

# 2 — Start ZK proof API (port 5000)
python app.py

# 3 — Install and start frontend (port 3000)
cd ../frontend && npm install && npm start
```

Or use the one-click scripts:

```bash
# Windows
start-demo.bat

# Linux / Mac
chmod +x start-demo.sh && ./start-demo.sh
```

---

## Demo Flow

1. **Landing page** — Hero section with strkBTC feature highlights
2. **Connect wallet** — Toggle between Demo mode (instant) or Production mode (Argent X / Braavos)
3. **Protocol stats** — Live dashboard: total strkBTC collateral, PUSD minted, collateral ratio, active positions
4. **Deposit strkBTC** — Enter amount + private key → backend generates Pedersen commitment proof → proof hash displayed
5. **Mint PUSD** — Enter borrow amount → live collateral requirement preview → mint stablecoin
6. **Position monitor** — Health factor bar, liquidation price, collateral ratio — all in real time

---

## Competitive Positioning

| Feature         | StarkStorm                      | ZenLend                        |
| --------------- | ------------------------------- | ------------------------------ |
| Privacy         | ❌ All amounts visible          | ✅ Zero-knowledge hidden       |
| strkBTC support | ❌ Not designed for private BTC | ✅ Purpose-built for strkBTC   |
| Lending model   | P2P coordination                | Protocol-based instant lending |
| Compliance      | —                               | ✅ Viewing key compatible      |
| Pricing         | Static                          | ✅ Live CoinGecko BTC feed     |

---

## Architecture

```
Browser (React 18)
  └─ Header          sticky nav · live BTC price · wallet connect
  └─ ProtocolStats   4 live stat cards (collateral · PUSD · ratio · positions)
  └─ WalletSection   hero landing (shown when disconnected)
  └─ DepositCollateral  strkBTC input → ZK commitment API → proof badge
  └─ MintPUSD        PUSD amount → live collateral preview → mint
  └─ UserPosition    health bar · liquidation price · ratio · actions

Flask API  (localhost:5000)
  └─ POST /generate-commitment   Pedersen commitment + nonce + verification data
  └─ GET  /health

Cairo Contracts  (Starknet Sepolia)
  └─ private_btc_lending.cairo   deposit · withdraw · mint · repay · liquidate
  └─ private_usd.cairo           PUSD ERC-20 stablecoin
```

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
│   │   ├── components/             # Header · WalletSection · ProtocolStats
│   │   │                           # DepositCollateral · MintPUSD · UserPosition
│   │   ├── hooks/                  # useWallet · useProtocol
│   │   └── services/               # priceService (CoinGecko)
│   └── package.json
├── Scarb.toml                       # Cairo build config
├── deploy.sh                        # Starknet deployment script
├── start-demo.bat / start-demo.sh   # One-click demo launchers
└── README.md
```

---

## Hackathon Tracks

### Privacy Track — $9,675 STRK

- Pedersen commitments (same cryptography as strkBTC)
- Cairo on-chain ZK proof verification
- Viewing key compatible audit design

### Bitcoin Track — $9,675 + $5,500 in-kind

- First DeFi lending protocol for strkBTC
- Real-time BTC price integration (CoinGecko)
- PUSD stablecoin minted against Bitcoin collateral

**Combined prize potential: $24,850**

---

## Cairo Contract Interface

```rust
// Core lending operations
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
#   "proof": {
#     "commitment_type": "pedersen",
#     "nonce": "0xfc9f310b...",
#     "verification_data": { "can_verify": true }
#   },
#   "success": true
# }
```

---

**Built for Re{define} Hackathon 2026 — Starknet's private Bitcoin era starts now.**

---

**GitHub:** https://github.com/ashitosh07/ZenLend  
**Starknet Wallet:** `0x02e534bcc1dabcd6daef55ab7a30c5ee953d4db2853d6a3613dc7b1b4d6ae4c7`
