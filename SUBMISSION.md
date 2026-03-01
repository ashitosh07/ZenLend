# ZenLend — Project Description

**Track:** Privacy + Bitcoin on Starknet  
**Prize Targets:** Privacy Track ($9,675 STRK) + Bitcoin Track ($9,675 + $5,500 in-kind)

---

## The Problem

Bitcoin DeFi has a fundamental privacy gap. Every lending protocol today exposes your collateral amount, borrow size, and health factor to anyone with a block explorer. When strkBTC launched — bringing Zcash-like shielded balances to Bitcoin on Starknet — it solved privacy at the asset layer. But no lending protocol existed that could actually use it privately. Depositing strkBTC into any current protocol immediately re-exposes everything it was designed to hide.

## What We Built

ZenLend is the first privacy-preserving Bitcoin lending protocol on Starknet, purpose-built for the strkBTC era.

Borrowers deposit strkBTC as collateral and mint PUSD — a private stablecoin — against it. The key difference: **the collateral amount is never stored on-chain in plain text.** Instead, we store a Pedersen commitment hash. On-chain, all anyone sees is `0x7bec6079bc6a27d...` — the actual BTC amount is cryptographically hidden.

This is not obscurity. It is the same Pedersen hash primitive that strkBTC itself is built on. We are composing existing trusted cryptography, not inventing new primitives.

## Technical Architecture

The system has three layers:

**1. ZK Commitment Layer (Python/Flask)**  
A local backend generates Pedersen commitments from the user's collateral amount and a private key. This runs on the user's machine — no amount data leaves their control. The commitment hash is what gets submitted to the contract.

**2. Cairo Smart Contracts (Starknet)**  
`private_btc_lending.cairo` stores commitments, tracks debt, and enables ZK-range-proof-based liquidation — verifying that collateral ≥ debt × 150% without ever revealing the actual numbers. `private_usd.cairo` is the PUSD ERC-20 stablecoin.

**3. React Frontend**  
A real-time dashboard with live BTC price from CoinGecko, position health monitoring, a collateral deposit flow that calls the commitment API and displays the proof hash, and a full repay/add-collateral interface.

## Why This Matters for the Hackathon Narrative

Privacy is the institutional priority for 2026. Institutions will not use DeFi if their trading positions, collateral sizes, and borrowing strategies are visible to competitors. ZenLend provides the infrastructure layer that makes private Bitcoin DeFi viable on Starknet.

The strkBTC announcement is the inflection point. ZenLend is the first protocol built specifically to capture it — the same week strkBTC launched.

## What Is Working Right Now

- **Live on Starknet Sepolia** — both contracts fully deployed and verified
- Live frontend with real-time CoinGecko BTC pricing
- Flask ZK commitment API generating real Pedersen hashes
- Complete Cairo contract interface for deposit, withdraw, mint, repay, and liquidation
- Position health monitoring with health factor, liquidation price, and interactive repay
- Demo wallet + production Argent X / Braavos wallet support

## Deployed Contracts (Starknet Sepolia)

| Contract          | Address                                                             |
| ----------------- | ------------------------------------------------------------------- |
| PrivateUSD (PUSD) | `0xa023bb6fda7d2753e8c6806b889c8b9a37b3c41784997bf24c6f2202cc9611`  |
| PrivateBTCLending | `0x6cd464fd97a0a48e203fff57bb4e550f50d92bd2903538dd639ed924f1635c8` |

RPC: `https://api.cartridge.gg/x/starknet/sepolia`  
Deployer: `0x02e534bcc1dabcd6daef55ab7a30c5ee953d4db2853d6a3613dc7b1b4d6ae4c7`

## Demo Video

🎥 **[https://www.loom.com/share/c61eabd2d50544209c00befb04f35098](https://www.loom.com/share/c61eabd2d50544209c00befb04f35098)** (8 min)

## What's Next

Integrate actual strkBTC token contract address, implement client-side commitment generation to remove the local backend dependency entirely, and add viewing key export for compliance use cases.

---

ZenLend is not a concept. It is a working protocol built for the moment strkBTC made private Bitcoin lending possible on Starknet.

---

**Starknet Wallet Address (Prize Distribution):**  
`0x02e534bcc1dabcd6daef55ab7a30c5ee953d4db2853d6a3613dc7b1b4d6ae4c7`
