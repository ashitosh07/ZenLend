# Bitcoin Proof-of-Reserves

Privacy-preserving solvency verification for Bitcoin custodians, verified on Starknet.

## Problem

Bitcoin custodians cannot prove solvency without revealing wallet addresses, balances, or individual UTXOs. This creates a trust problem: users must believe custodians hold sufficient reserves.

## What This Proves

**"I know a private set of Bitcoin UTXO values whose total sum is ≥ my claimed liability."**

The custodian proves solvency without revealing:
- Wallet addresses
- Individual UTXO amounts
- Transaction history

## What This Does NOT Prove

This is explicitly out of scope:
- Ownership of Bitcoin private keys
- Transaction-level privacy
- Live Bitcoin node integration

This is an audit primitive, not a wallet or payment system.

## Why Starknet?

Starknet provides:
1. **Public verifiability** – anyone can check the proof on-chain
2. **Permanent record** – verification history is immutable
3. **Low cost** – proof verification is cheaper than Ethereum L1
4. **Cairo's expressiveness** – natural fit for constraint verification

## Architecture

```
Off-chain:  Private UTXOs → Proof Generator → Proof
On-chain:   Proof → Cairo Verifier → Public Status
```

**Off-chain:** Custodian computes sum of private UTXO values and generates proof  
**On-chain:** Cairo contract verifies `sum(UTXOs) ≥ liability` and stores result  
**Public:** Anyone queries verification status

## Demo Flow

1. Custodian claims liability (e.g., 2.0 BTC)
2. Custodian generates proof from private UTXOs
3. Proof submitted to Starknet contract
4. Contract verifies and stores result
5. Public queries verification status

## Project Structure

```
/contracts   → Cairo verifier contract
/proof       → Off-chain proof generation (Python)
/frontend    → Minimal demo UI (HTML/JS)
```

## Running the Demo

**Proof generation:**
```bash
python proof/generator.py
```

**Frontend:**
```bash
open frontend/index.html
```

**Cairo contract:**
```bash
scarb build
starkli deploy contracts/proof_of_reserves.cairo
```

## Limitations

This is a hackathon proof-of-concept:
- Simplified cryptographic commitment (not production ZK)
- Simulated UTXO values (no real Bitcoin integration)
- Trust assumption on submitted sum (production needs ZK proof)

## Future Work

- Full ZK-SNARK proof of UTXO sum
- Bitcoin SPV proof integration
- Multi-custodian aggregation
- Periodic re-verification enforcement

---

**Built for Bitcoin & Privacy Hackathon**  
Honest engineering. Clear claims. No hype.
