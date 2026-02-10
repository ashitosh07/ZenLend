"""
Bitcoin Proof-of-Reserves: Off-chain Proof Generator

This module generates a simple proof that:
  sum(private_utxo_values) >= claimed_liability

LIMITATIONS (by design):
- Does not verify Bitcoin signatures
- Does not connect to Bitcoin nodes
- Uses simulated UTXO values for demo
- Proof is simplified for hackathon scope
"""

import hashlib
from typing import List


class ProofGenerator:
    def __init__(self, utxo_values: List[int]):
        """
        Initialize with private UTXO values (in satoshis).
        
        Args:
            utxo_values: List of Bitcoin UTXO amounts (private)
        """
        self.utxo_values = utxo_values
        self.utxo_sum = sum(utxo_values)
    
    def generate_proof(self, claimed_liability: int) -> dict:
        """
        Generate proof that sum(UTXOs) >= liability.
        
        Args:
            claimed_liability: Public liability amount (in satoshis)
            
        Returns:
            dict with proof components for Cairo contract
        """
        # Verify constraint locally
        assert self.utxo_sum >= claimed_liability, "Insufficient reserves"
        
        # Create commitment to private values (proof hash)
        # In production: this would be a ZK proof commitment
        proof_hash = self._compute_commitment()
        
        return {
            "claimed_liability": claimed_liability,
            "utxo_sum": self.utxo_sum,
            "proof_hash": proof_hash,
            "utxo_count": len(self.utxo_values)
        }
    
    def _compute_commitment(self) -> str:
        """
        Compute cryptographic commitment to UTXO values.
        
        In production: Use Pedersen commitments or ZK-SNARK proof.
        For PoC: Simple hash commitment.
        """
        data = ",".join(str(v) for v in sorted(self.utxo_values))
        return hashlib.sha256(data.encode()).hexdigest()


def demo_proof_generation():
    """Demo: Custodian with 3 private UTXOs proving solvency."""
    
    # Private: Custodian's actual UTXO values (in satoshis)
    private_utxos = [
        50_000_000,  # 0.5 BTC
        75_000_000,  # 0.75 BTC
        100_000_000  # 1.0 BTC
    ]
    
    # Public: Claimed liability
    claimed_liability = 200_000_000  # 2.0 BTC
    
    print("=== Bitcoin Proof-of-Reserves Demo ===\n")
    print(f"Claimed Liability: {claimed_liability / 1e8:.2f} BTC")
    print(f"Private UTXO Count: {len(private_utxos)}")
    print(f"Private UTXO Sum: {sum(private_utxos) / 1e8:.2f} BTC\n")
    
    # Generate proof
    prover = ProofGenerator(private_utxos)
    proof = prover.generate_proof(claimed_liability)
    
    print("Generated Proof:")
    print(f"  Liability: {proof['claimed_liability']}")
    print(f"  UTXO Sum: {proof['utxo_sum']}")
    print(f"  Proof Hash: {proof['proof_hash'][:16]}...")
    print(f"  Status: ✓ Solvent\n")
    
    return proof


if __name__ == "__main__":
    demo_proof_generation()
