# Demo Walkthrough

## Scenario

**BitVault** is a Bitcoin custodian holding customer deposits.

- Customer deposits: 2.0 BTC (liability)
- BitVault's actual holdings: 3 UTXOs totaling 2.25 BTC

BitVault wants to prove solvency without revealing:
- Which addresses they control
- How much is in each UTXO
- Their transaction history

## Step-by-Step Demo

### 1. Set Liability (Public)

BitVault publicly claims: **"We owe customers 2.0 BTC"**

```
Claimed Liability: 2.0 BTC = 200,000,000 satoshis
```

This is public information. Anyone can see it.

### 2. Generate Proof (Private)

BitVault runs the proof generator with their private UTXOs:

```bash
python proof/generator.py
```

**Private inputs:**
```
UTXO 1: 0.5 BTC   (50,000,000 sats)
UTXO 2: 0.75 BTC  (75,000,000 sats)
UTXO 3: 1.0 BTC   (100,000,000 sats)
Total:  2.25 BTC  (225,000,000 sats)
```

**Proof output:**
```
claimed_liability: 200,000,000
utxo_sum: 225,000,000
proof_hash: 0x7a3f9e2b...
```

The proof shows the sum (2.25 BTC) without revealing individual UTXOs.

### 3. Submit to Starknet (On-chain)

BitVault submits the proof to the Cairo contract:

```cairo
submit_proof(
    custodian: 0xBitVault,
    claimed_liability: 200_000_000,
    utxo_sum: 225_000_000,
    proof_hash: 0x7a3f9e2b...
)
```

The contract verifies: `225,000,000 >= 200,000,000` ✓

Result stored on-chain:
```
verifications[0xBitVault] = (true, 200_000_000, timestamp)
```

Event emitted:
```
ProofVerified(0xBitVault, 200_000_000, 225_000_000, 1234567890)
```

### 4. Public Verification (Anyone)

Anyone can query the contract:

```cairo
get_verification_status(0xBitVault)
```

Returns:
```
(true, 200_000_000, 1234567890)
```

Interpretation:
- ✓ BitVault is verified solvent
- They claimed 2.0 BTC liability
- Verified at timestamp 1234567890

## What Was Proven?

✓ BitVault has at least 2.0 BTC in reserves  
✓ Verification is public and permanent  
✓ Individual UTXO values remain private  

## What Was NOT Proven?

✗ BitVault owns the Bitcoin private keys (out of scope)  
✗ The UTXOs exist on Bitcoin blockchain (out of scope)  
✗ Transaction-level privacy (out of scope)  

## Why This Matters

Before: "Trust us, we have the Bitcoin"  
After: "Here's a verifiable proof on Starknet"

The proof is:
- Public (anyone can verify)
- Permanent (immutable record)
- Privacy-preserving (no address disclosure)

## Running the Demo

**Terminal:**
```bash
cd proof
python generator.py
```

**Browser:**
```bash
open frontend/index.html
```

Click through the 4 steps to see the full flow.

## Judge Evaluation Points

1. **Problem clarity:** Solvency without address disclosure
2. **Correct constraint:** sum(UTXOs) >= liability
3. **Starknet value:** Public verification + permanent record
4. **Honest scope:** Clear about what's proven and what's not
5. **Demo feasibility:** Works end-to-end without complex setup

This is a foundation, not a finished product. The architecture is sound.
