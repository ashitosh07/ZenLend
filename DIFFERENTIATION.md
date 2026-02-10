# How This Differs From Transaction Privacy Systems

## This Project: Audit Primitive

**Purpose:** Prove institutional solvency  
**Users:** Bitcoin custodians, exchanges, banks  
**Privacy goal:** Hide reserve composition, not transactions  
**Verification:** Public, on-chain, permanent  
**Frequency:** Periodic audits (monthly/quarterly)  

**What's private:**
- Which addresses custodian controls
- Individual UTXO amounts
- Reserve allocation strategy

**What's public:**
- Total liability claim
- Verification status (solvent/insolvent)
- Timestamp of proof

## Transaction Privacy Systems (e.g., Mixers, Private Transfers)

**Purpose:** Hide payment flows  
**Users:** Individual users making transactions  
**Privacy goal:** Hide sender, receiver, amount  
**Verification:** Private, app-layer  
**Frequency:** Per-transaction  

**What's private:**
- Who paid whom
- Transaction amounts
- Payment history

**What's public:**
- Nothing (by design)

## Key Distinction

| Aspect | This Project | Transaction Privacy |
|--------|-------------|---------------------|
| Layer | Audit/Compliance | Application |
| Transparency | High (public verification) | Low (private by default) |
| Target | Institutions | Individuals |
| Regulatory | Audit-friendly | Compliance risk |
| Bitcoin Integration | Reserve proof | Payment routing |

## Why Judges Won't Confuse These

1. **Different problem space:** Solvency ≠ Payment privacy
2. **Different users:** Custodians ≠ Transactors
3. **Different verification:** Public ≠ Private
4. **Different narrative:** "Prove you have reserves" ≠ "Hide who paid"

## Comparable Projects (What We're Actually Like)

- Proof-of-Solvency protocols (e.g., Provisions)
- Exchange reserve attestations
- Merkle tree liability proofs

We're in the "institutional transparency" category, not "user privacy" category.

## Judge Evaluation Clarity

If a judge asks: "How is this different from [privacy coin/mixer]?"

Answer: "Those hide transactions. This proves reserves. Different layer, different goal."

The architecture makes this obvious.
