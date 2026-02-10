# Private Bitcoin Proof-of-Reserves

A privacy-preserving Proof-of-Reserves (PoR) system that allows Bitcoin custodians to prove solvency **without revealing wallet addresses, balances, or individual UTXOs**, with public verification recorded on Starknet.

---

## Overview

Proof-of-Reserves is increasingly demanded after custodial failures in the Bitcoin ecosystem.  
However, existing PoR approaches require custodians to publicly disclose wallet addresses and balances, creating serious privacy and security risks.

This project demonstrates a different model: **publicly verifiable solvency without financial disclosure**.

---

## Problem

Today, Bitcoin custodians face a false tradeoff:

- **Transparency** → disclose wallets and balances
- **Privacy** → users must trust opaque claims

Public address-based Proof-of-Reserves exposes sensitive financial data and creates attack surfaces, while private attestations provide no cryptographic assurance.

---

## Solution

**Private Bitcoin Proof-of-Reserves** enables a custodian to cryptographically and publicly prove the following statement:

> **“I know a private set of Bitcoin UTXO values whose total sum is greater than or equal to my publicly claimed liability.”**

The proof:

- Reveals no wallet addresses
- Reveals no individual UTXO values
- Reveals no transaction history

Only the solvency condition is verified.

---

## What This Project Proves

- Reserve sufficiency relative to a public liability threshold
- Public, on-chain verifiability of solvency claims
- Separation of transparency from financial disclosure

---

## What This Project Does NOT Prove

This project is intentionally scoped as an audit primitive. It does **not** prove:

- Ownership of Bitcoin private keys
- Transaction-level privacy
- Live Bitcoin node or SPV integration

These are explicitly out of scope for this prototype.

---

## Architecture

Off-chain (Private)
Bitcoin UTXO Values
│
▼
Proof / Commitment Generation
│
▼
On-chain (Public)
Starknet Cairo Verifier
│
▼
Public Solvency Status

**Off-chain:**  
The custodian aggregates private UTXO values and generates a cryptographic commitment and proof inputs.

**On-chain:**  
A Cairo smart contract verifies the solvency constraint and records the verification result.

**Public:**  
Anyone can query the contract to verify that reserves are sufficient, without learning anything else.

---

## Why Starknet

Starknet is uniquely suited for this use case:

- **Public verifiability** without disclosing sensitive data
- **Persistent audit trail** of solvency attestations
- **STARK-based verification**, scalable and quantum-safe
- **Cairo’s expressiveness**, well-suited for constraint validation

This enables **accountability without surveillance**.

---

## Demo Flow

1. Custodian declares a public liability (e.g., 2.0 BTC)
2. Custodian generates a proof from private UTXO values
3. Proof is submitted to a Starknet verifier contract
4. Contract verifies the solvency constraint
5. Public users query the verification status on-chain

---

## Project Structure

```
/contracts → Cairo verifier contract
/proof → Off-chain proof generation (Python)
/frontend → Minimal demo UI
```

## Quick Start

**Test proof generation:**
```bash
cd proof
python generator.py
```

**Run demo UI:**
```bash
open frontend/index.html
```

See [QUICKSTART.md](QUICKSTART.md) for detailed instructions.

---

## Limitations (By Design)

This is a hackathon proof-of-concept:

- Uses simplified commitments instead of full zero-knowledge proofs
- Simulated Bitcoin UTXO values (no live BTC integration)
- Demonstrates verification flow and constraints, not cryptographic finality

The goal is to validate the **verifiability model**, not production readiness.

---

## Future Work

- Full zero-knowledge proof enforcing UTXO commitments
- Proof of UTXO ownership via Bitcoin signatures
- Liability commitments using Merkle roots
- Periodic, enforceable re-verification
- Exchange and DAO treasury integrations

---

## Hackathon Submission

- Event: Bitcoin & Privacy Hackathon
- Track: Privacy
- Builder: Solo
- Network: Starknet Testnet

---

**Honest scope. Clear claims. Verifiable solvency without disclosure.**
