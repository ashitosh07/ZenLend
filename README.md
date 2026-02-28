# ZenLend - Private Bitcoin Lending Protocol

**🏆 Re{define} Hackathon 2026 - Privacy Track & Bitcoin Track Submission**

The first **privacy-preserving** Bitcoin lending protocol on Starknet — built for the **strkBTC era**. As Starknet launches strkBTC with Zcash-like privacy features, ZenLend is the DeFi protocol purpose-built to leverage private Bitcoin on Starknet.

## 🎯 Core Innovation

**Privacy-Native DeFi for strkBTC**

Starknet just announced [strkBTC](https://twitter.com/Starknet/status/1894853396) — a wrapped Bitcoin token with built-in privacy (shielded balances, confidential transfers, viewing keys). ZenLend is the lending protocol designed for this new era:

- **strkBTC Collateral**: Deposit private Bitcoin, keep amounts hidden via Pedersen commitments
- **Zero-Knowledge Proofs**: Verify solvency without revealing collateral size
- **Protocol Lending**: Instant PUSD stablecoin minting (not P2P coordination)
- **Cairo Verification**: On-chain ZK proof validation native to Starknet
- **Viewing Key Compatible**: Audit-friendly design matching strkBTC's compliance model

## 🔗 Why strkBTC + ZenLend

strkBTC provides **privacy at the asset level** (shielded balances, confidential transfers).  
ZenLend provides **privacy at the protocol level** (hidden collateral ratios, private lending).

Together they form a **complete privacy stack** for Bitcoin DeFi on Starknet:

```
strkBTC (Private Asset Layer)
    ↕ shielded balances + confidential transfers
ZenLend (Private DeFi Layer)
    ↕ hidden collateral + ZK-verified lending
PUSD (Private Stablecoin Output)
```

## 🚀 Quick Demo

**One-click startup:**

```bash
# Windows
start-demo.bat

# Linux/Mac
chmod +x start-demo.sh && ./start-demo.sh
```

**Or manual setup:**

```bash
# Backend (Python ZK commitments)
cd commitments && pip install -r requirements.txt && python app.py

# Frontend (React app)
cd frontend && npm install && npm start
```

**Demo URL:** http://localhost:3000

## 🔥 Competitive Advantage

| Feature        | StarkStorm (Transparent)        | ZenLend (Private)                          |
| -------------- | ------------------------------- | ------------------------------------------ |
| **Privacy**    | ❌ All amounts visible          | ✅ Zero-knowledge hidden                   |
| **strkBTC**    | ❌ Not designed for private BTC | ✅ Built for strkBTC era                   |
| **Model**      | P2P coordination                | Protocol-based instant lending             |
| **Compliance** | N/A                             | ✅ Viewing key compatible                  |
| **Focus**      | Generic tokens                  | Bitcoin-specialized with real-time pricing |

## 🏗️ Architecture

```
strkBTC (Private Bitcoin)
    ↓
Frontend (React)
    ↓
Flask API (ZK Commitment Generation)
    ↓
Cairo Contracts (Starknet)
    ↓
Private Lending Protocol + PUSD Minting
```

### Key Components

- **Pedersen Commitments**: Same cryptographic primitives used by strkBTC
- **ZK Proofs**: Prove collateral sufficiency without revealing amounts
- **Real-time Pricing**: Live BTC feeds via CoinGecko API
- **Private Governance**: Zero-knowledge voting system
- **Viewing Key Design**: Compliance-compatible privacy (like strkBTC)

## 🎯 Hackathon Tracks

### Privacy Track ($9,675 STRK)

- ✅ Pedersen commitment privacy (same crypto as strkBTC)
- ✅ Zero-knowledge proof verification in Cairo
- ✅ Private governance voting
- ✅ Viewing key compatible audit design

### Bitcoin Track ($9,675 + $5,500 in-kind)

- ✅ Built for strkBTC — Starknet's official private Bitcoin
- ✅ Real-time BTC price integration
- ✅ PUSD stablecoin minting against BTC collateral
- ✅ First DeFi protocol designed for private Bitcoin

**Total Prize Potential: $24,850**

## 💻 Technical Implementation

### Smart Contracts (Cairo)

- `contracts/private_btc_lending.cairo` — Main lending logic with ZK verification
- `contracts/private_usd.cairo` — PUSD stablecoin contract

### Backend (Python)

- `commitments/app.py` — Flask API server
- `commitments/pedersen.py` — ZK commitment generation
- `commitments/integration.py` — Cairo contract integration

### Frontend (React)

- `frontend/src/components/` — UI components
- `frontend/src/hooks/` — Custom React hooks
- `frontend/src/services/` — Price feeds & API integration

## 🔒 Privacy Features

1. **Deposit Privacy**: Collateral amounts hidden via Pedersen commitments
2. **Borrowing Privacy**: Loan amounts not revealed publicly
3. **Position Privacy**: Portfolio values cryptographically secured
4. **Governance Privacy**: Zero-knowledge voting on protocol decisions
5. **Compliance Ready**: Viewing key design for regulatory compatibility

## 🎮 Demo Flow

1. **Connect Wallet** — Demo mode (instant) or Production mode (Argent X/Braavos)
2. **Deposit strkBTC** — Enter amount, generate private commitment proof
3. **Mint PUSD** — Borrow stablecoins against private collateral (max 66% LTV)
4. **Monitor Position** — Real-time health without exposing amounts
5. **Private Governance** — Vote on proposals with zero-knowledge proofs

## 🏆 Why This Wins

### Perfect Timing

- **strkBTC just announced** (Feb 26, 2026) — we're already built for it
- **Privacy is Starknet's narrative** — Eli Ben-Sasson's vision validated
- **First DeFi for private Bitcoin** — no competitors in this space

### Technical Excellence

- **Real cryptography** using same Pedersen commitments as strkBTC
- **Production-ready** full-stack implementation
- **Cairo-native** ZK proof verification
- **Compliance-first** viewing key design

### Market Innovation

- **strkBTC needs DeFi** — we're the first lending protocol ready
- **Institutional demand** — privacy + compliance = enterprise adoption
- **Dual-track eligible** — Privacy Track + Bitcoin Track

---

**🚀 Built for Re{define} Hackathon 2026**  
_The first DeFi protocol for Starknet's private Bitcoin era_
