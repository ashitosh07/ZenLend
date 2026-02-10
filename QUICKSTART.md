# Quickstart Guide

## Prerequisites

- Python 3.8+
- Web browser (for frontend demo)
- Scarb (for Cairo compilation) - optional

## 1. Test Proof Generation (30 seconds)

**Run demo:**
```bash
cd proof
python generator.py
```

**Run all test scenarios:**
```bash
python test.py
```

**Expected output:**
```
=== Bitcoin Proof-of-Reserves Demo ===

Claimed Liability: 2.00 BTC
Private UTXO Count: 3
Private UTXO Sum: 2.25 BTC

Generated Proof:
  Liability: 200000000
  UTXO Sum: 225000000
  Proof Hash: 7a3f9e2b...
  Status: ✓ Solvent
```

## 2. Run Frontend Demo (1 minute)

```bash
# Open in browser
open frontend/index.html
# or on Windows:
start frontend/index.html
```

**Demo steps:**
1. Click "Set Liability" → sets 2.0 BTC claim
2. Click "Generate Proof" → computes sum from private UTXOs
3. Click "Submit Proof to Contract" → simulates Starknet submission
4. Click "Check Verification Status" → shows public verification

## 3. Compile Cairo Contract (optional)

```bash
scarb build
```

**Expected output:**
```
Compiling bitcoin_proof_of_reserves v0.1.0
Finished release target(s) in 2.3s
```

## Testing Different Scenarios

### Scenario 1: Solvent Custodian (Default)
```python
private_utxos = [50_000_000, 75_000_000, 100_000_000]  # 2.25 BTC
claimed_liability = 200_000_000  # 2.0 BTC
# Result: ✓ Solvent
```

### Scenario 2: Insolvent Custodian
Edit `proof/generator.py`:
```python
private_utxos = [50_000_000, 75_000_000]  # 1.25 BTC
claimed_liability = 200_000_000  # 2.0 BTC
# Result: AssertionError: Insufficient reserves
```

### Scenario 3: Exact Match
```python
private_utxos = [200_000_000]  # 2.0 BTC
claimed_liability = 200_000_000  # 2.0 BTC
# Result: ✓ Solvent (edge case)
```

## Verify Contract Logic

The core constraint in `contracts/proof_of_reserves.cairo`:

```cairo
assert(utxo_sum >= claimed_liability, 'Insufficient reserves');
```

This is the only verification rule. Everything else is storage and events.

## What You're Testing

✓ Proof generation computes sum correctly  
✓ Constraint enforcement (sum >= liability)  
✓ Frontend demo flow works end-to-end  
✓ Cairo contract compiles without errors  

## Troubleshooting

**Python error:**
```bash
# No dependencies needed, uses stdlib only
python3 generator.py
```

**Cairo compilation fails:**
```bash
# Install Scarb
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
```

**Frontend doesn't open:**
```bash
# Manually navigate to:
file:///path/to/Starknet/frontend/index.html
```

## Deploy to Starknet (Advanced)

```bash
# Declare contract
starkli declare target/dev/bitcoin_proof_of_reserves_ProofOfReserves.contract_class.json

# Deploy
starkli deploy <CLASS_HASH>

# Interact
starkli invoke <CONTRACT_ADDRESS> submit_proof \
  0x123 \           # custodian
  200000000 \       # liability
  225000000 \       # utxo_sum
  0xabc...          # proof_hash
```

## Quick Validation Checklist

- [ ] Proof generator runs and outputs sum
- [ ] Frontend loads and buttons work
- [ ] Cairo contract compiles (if Scarb installed)
- [ ] Insufficient reserves scenario fails correctly
- [ ] Solvent scenario passes

**Total test time: 2-3 minutes**

## For Judges

Run `python proof/generator.py` to see the core logic in action.

The output shows:
- Private inputs (UTXO values)
- Public output (sum and commitment)
- Constraint verification (sum >= liability)

This demonstrates the verifiability model without requiring Starknet deployment.
