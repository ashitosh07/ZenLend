# Technical Design

## Core Constraint

```
sum(private_utxo_values) >= claimed_liability
```

This is the only constraint we verify.

## Cryptographic Approach (Simplified for PoC)

### Off-chain
1. Custodian has private UTXO values: `[v1, v2, ..., vn]`
2. Compute sum: `S = v1 + v2 + ... + vn`
3. Generate commitment: `H = hash(v1, v2, ..., vn)`
4. Check constraint: `S >= L` (where L = liability)
5. Output proof: `(L, S, H)`

### On-chain (Cairo)
1. Accept inputs: `(custodian_id, L, S, H)`
2. Verify constraint: `assert S >= L`
3. Store result: `verifications[custodian_id] = (true, L, timestamp)`
4. Emit event: `ProofVerified(custodian_id, L, S, timestamp)`

## What's Missing (Intentionally)

This PoC does NOT include:
- Zero-knowledge proof that S is computed correctly
- Bitcoin signature verification
- SPV proofs of UTXO existence
- Merkle proofs of blockchain inclusion

These would be required for production but are out of scope for this hackathon.

## Trust Assumptions

Current trust model:
- Custodian honestly computes sum S
- Commitment H binds to actual UTXOs
- No verification of Bitcoin ownership

Production trust model would require:
- ZK-SNARK proving S = sum(v1, ..., vn) without revealing vi
- Bitcoin SPV proofs that UTXOs exist
- Signature proofs of ownership

## Why This Is Still Valuable

Even with simplified cryptography, this demonstrates:
1. The correct problem framing
2. The right constraint to verify
3. How Starknet enables public verification
4. The architecture for a production system

Judges can evaluate the approach, not just the implementation depth.

## Complexity Trade-offs

We chose simplicity because:
- Full ZK proofs require weeks of engineering
- The core insight is the constraint, not the proof system
- Hackathon judges value clarity over completeness
- This is an honest foundation for future work

## Security Notes

**Current security:** None. This is a demo.

**Production security would require:**
- Fiat-Shamir transformed ZK proof
- Pedersen commitments for hiding
- Range proofs for UTXO values
- Bitcoin SPV integration
- Slashing for false proofs
