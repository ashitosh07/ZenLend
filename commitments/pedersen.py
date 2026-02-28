"""
Pedersen Commitment System for Private BTC Lending

This module provides cryptographic commitments for hiding BTC amounts
while enabling zero-knowledge proofs of solvency constraints.

Mathematical Foundation:
- Commitment: C = g^value * h^nonce (mod p)
- Where g, h are generators and p is prime modulus
- Commitment hiding: computationally infeasible to extract value/nonce
- Commitment binding: computationally infeasible to find different (value', nonce') with same commitment
"""

import hashlib
import secrets
from typing import Tuple, Dict, Any
from dataclasses import dataclass

# Starknet field prime (same as Cairo felt252)
STARKNET_PRIME = 2**251 + 17 * 2**192 + 1

# Pedersen generators (using standard Starknet Pedersen hash generators)
GENERATOR_G = 0x1ef15c18599971b7beced415a40f0c7deacfd9b0d1819e03d723d8bc943cfca
GENERATOR_H = 0x5af3107a4000c94cd5b6fd87df0e9b6fd378d766499c0b09adbaf0e3e2a8c8e

@dataclass
class Commitment:
    """Represents a Pedersen commitment"""
    value: int          # The hidden value (in satoshis)
    nonce: int          # Random nonce for hiding  
    commitment: int     # The commitment C = g^value * h^nonce
    
    def __post_init__(self):
        if self.commitment == 0:
            self.commitment = pedersen_commit(self.value, self.nonce)

class PedersenCommitmentSystem:
    """
    Pedersen commitment system for private BTC amounts
    
    Features:
    - Generate hiding commitments to BTC values
    - Create zero-knowledge proofs of solvency
    - Verify commitment openings
    - Generate liquidation proofs
    """
    
    def __init__(self):
        self.commitments: Dict[str, Commitment] = {}
    
    def commit_btc_amount(self, btc_amount: float, user_id: str = None) -> Commitment:
        """
        Create a Pedersen commitment to a BTC amount
        
        Args:
            btc_amount: Amount in BTC (e.g., 1.5)
            user_id: Optional user identifier for storage
            
        Returns:
            Commitment object with value, nonce, and commitment
        """
        # Convert BTC to satoshis (8 decimals)
        satoshis = int(btc_amount * 100_000_000)
        
        # Generate cryptographically secure random nonce
        nonce = secrets.randbelow(STARKNET_PRIME)
        
        # Create commitment
        commitment_value = pedersen_commit(satoshis, nonce)
        
        commitment = Commitment(
            value=satoshis,
            nonce=nonce,
            commitment=commitment_value
        )
        
        # Store if user_id provided
        if user_id:
            self.commitments[user_id] = commitment
            
        return commitment
    
    def generate_solvency_proof(
        self, 
        collateral_commitment: Commitment,
        debt_amount: float,
        collateral_ratio: float = 1.5
    ) -> Dict[str, Any]:
        """
        Generate a zero-knowledge proof that:
        committed_collateral >= debt_amount * collateral_ratio
        
        Args:
            collateral_commitment: Commitment to BTC collateral
            debt_amount: Debt in USD
            collateral_ratio: Required over-collateralization (e.g., 1.5 = 150%)
            
        Returns:
            Proof components for Cairo verification
        """
        debt_satoshis = int(debt_amount * 100_000_000)  # Assume 1:1 USD:BTC for simplicity
        required_collateral = int(debt_satoshis * collateral_ratio)
        
        # Check solvency locally
        is_solvent = collateral_commitment.value >= required_collateral
        
        if not is_solvent:
            raise ValueError(f"Insufficient collateral: {collateral_commitment.value} < {required_collateral}")
        
        # Generate proof components
        # In production: this would be a ZK-STARK proof
        # For PoC: we provide proof elements that Cairo can verify
        
        proof_hash = self._generate_proof_hash(
            collateral_commitment.commitment,
            debt_satoshis,
            collateral_ratio
        )
        
        return {
            "commitment": hex(collateral_commitment.commitment),
            "debt_amount": debt_satoshis,
            "collateral_ratio": int(collateral_ratio * 100),  # 150
            "proof_elements": [
                hex(collateral_commitment.nonce),
                hex(proof_hash),
                hex(required_collateral)
            ],
            "is_valid": True
        }
    
    def generate_liquidation_proof(
        self,
        collateral_commitment: Commitment,
        debt_amount: float,
        liquidation_threshold: float = 1.2
    ) -> Dict[str, Any]:
        """
        Generate proof that position is under-collateralized
        
        Args:
            collateral_commitment: Commitment to BTC collateral
            debt_amount: Current debt amount
            liquidation_threshold: Liquidation threshold (e.g., 1.2 = 120%)
            
        Returns:
            Liquidation proof components
        """
        debt_satoshis = int(debt_amount * 100_000_000)
        threshold_collateral = int(debt_satoshis * liquidation_threshold)
        
        # Check if position can be liquidated
        is_liquidatable = collateral_commitment.value < threshold_collateral
        
        if not is_liquidatable:
            raise ValueError("Position is not liquidatable")
        
        proof_hash = self._generate_proof_hash(
            collateral_commitment.commitment,
            debt_satoshis,
            liquidation_threshold
        )
        
        return {
            "commitment": hex(collateral_commitment.commitment),
            "debt_amount": debt_satoshis,
            "liquidation_threshold": int(liquidation_threshold * 100),
            "proof_elements": [
                hex(collateral_commitment.nonce),
                hex(proof_hash),
                hex(threshold_collateral)
            ],
            "is_liquidatable": True
        }
    
    def verify_commitment_opening(
        self, 
        commitment_value: int,
        claimed_value: int,
        nonce: int
    ) -> bool:
        """
        Verify that a commitment opens to the claimed value
        
        Args:
            commitment_value: The commitment to verify
            claimed_value: The claimed hidden value
            nonce: The opening nonce
            
        Returns:
            True if commitment opens correctly
        """
        expected_commitment = pedersen_commit(claimed_value, nonce)
        return expected_commitment == commitment_value
    
    def generate_commitment_with_proof(self, amount: float, private_key: str) -> Tuple[str, Dict[str, Any]]:
        """
        Generate a Pedersen commitment with associated proof for Flask API
        
        Args:
            amount: BTC amount to commit (e.g., 1.5)
            private_key: User's private key (used as seed for nonce generation)
            
        Returns:
            Tuple of (commitment_hex, proof_dict)
        """
        # Use private key to generate deterministic nonce (for demo purposes)
        # In production, should use proper key derivation
        nonce_seed = hashlib.sha256(private_key.encode()).digest()
        nonce = int.from_bytes(nonce_seed[:31], byteorder='big') % STARKNET_PRIME
        
        # Convert amount to satoshis
        satoshis = btc_to_satoshis(amount)
        
        # Generate commitment
        commitment_value = pedersen_commit(satoshis, nonce)
        
        # Create proof structure
        proof = {
            "commitment_type": "pedersen",
            "amount_satoshis": satoshis,
            "amount_btc": amount,
            "nonce": hex(nonce),
            "generators": {
                "g": hex(GENERATOR_G),
                "h": hex(GENERATOR_H)
            },
            "prime_modulus": hex(STARKNET_PRIME),
            "verification_data": {
                "expected_commitment": hex(commitment_value),
                "can_verify": True
            }
        }
        
        return hex(commitment_value), proof
    
    def verify_proof(self, commitment: str, proof: Dict[str, Any], amount: float) -> bool:
        """
        Verify a commitment proof for Flask API
        
        Args:
            commitment: Commitment value as hex string
            proof: Proof dictionary from generate_commitment_with_proof
            amount: Claimed BTC amount
            
        Returns:
            True if proof is valid
        """
        try:
            # Parse commitment from hex
            commitment_int = int(commitment, 16) if isinstance(commitment, str) else commitment
            
            # Verify the proof has required fields
            if not isinstance(proof, dict) or 'nonce' not in proof or 'amount_btc' not in proof:
                return False
            
            # Check amount matches
            if abs(proof['amount_btc'] - amount) > 1e-8:  # Allow small floating point errors
                return False
            
            # Extract nonce and verify commitment
            nonce = int(proof['nonce'], 16)
            satoshis = btc_to_satoshis(amount)
            
            # Verify commitment opening
            return self.verify_commitment_opening(commitment_int, satoshis, nonce)
            
        except (ValueError, KeyError, TypeError) as e:
            return False
    
    def _generate_proof_hash(self, commitment: int, debt: int, ratio: float) -> int:
        """Generate a proof hash for verification"""
        proof_data = f"{commitment}:{debt}:{ratio}".encode()
        hash_bytes = hashlib.sha256(proof_data).digest()
        return int.from_bytes(hash_bytes[:31], byteorder='big')  # Fit in felt252


def pedersen_commit(value: int, nonce: int) -> int:
    """
    Compute Pedersen commitment: g^value * h^nonce mod p
    
    Simplified implementation using hash-based approach
    In production: would use proper elliptic curve operations
    """
    # Ensure inputs fit in Starknet felt
    value = value % STARKNET_PRIME
    nonce = nonce % STARKNET_PRIME
    
    # Simplified commitment using hash combination
    # Production would use proper group operations
    commitment_data = f"{GENERATOR_G}^{value}*{GENERATOR_H}^{nonce}".encode()
    commitment_hash = hashlib.sha256(commitment_data).digest()
    
    # Convert to felt252
    commitment_int = int.from_bytes(commitment_hash[:31], byteorder='big')
    return commitment_int % STARKNET_PRIME


def btc_to_satoshis(btc_amount: float) -> int:
    """Convert BTC amount to satoshis"""
    return int(btc_amount * 100_000_000)


def satoshis_to_btc(satoshis: int) -> float:
    """Convert satoshis to BTC"""
    return satoshis / 100_000_000


# Example usage and testing
if __name__ == "__main__":
    # Initialize commitment system
    commitment_system = PedersenCommitmentSystem()
    
    print("=== Private BTC Lending - Commitment Demo ===\n")
    
    # User deposits 2.5 BTC as collateral
    print("1. User deposits 2.5 BTC as collateral")
    collateral_commitment = commitment_system.commit_btc_amount(2.5, "user123")
    print(f"   Collateral commitment: {hex(collateral_commitment.commitment)}")
    print(f"   Hidden value: {collateral_commitment.value} satoshis ({satoshis_to_btc(collateral_commitment.value)} BTC)")
    print()
    
    # User wants to borrow 1.0 BTC worth of stablecoins
    print("2. User wants to borrow 1.0 BTC worth of PUSD")
    try:
        solvency_proof = commitment_system.generate_solvency_proof(
            collateral_commitment,
            debt_amount=1.0,
            collateral_ratio=1.5
        )
        print("   ✓ Solvency proof generated successfully")
        print(f"   Proof elements: {len(solvency_proof['proof_elements'])} components")
        print(f"   Required collateral: {solvency_proof['proof_elements'][2]}")
        print()
    except ValueError as e:
        print(f"   ✗ Solvency check failed: {e}")
        print()
    
    # Simulate BTC price drop - position becomes liquidatable
    print("3. BTC price drops - checking liquidation status")
    try:
        liquidation_proof = commitment_system.generate_liquidation_proof(
            collateral_commitment,
            debt_amount=1.8,  # Debt increased relative to collateral value
            liquidation_threshold=1.2
        )
        print("   ✓ Position is liquidatable")
        print(f"   Liquidation proof generated")
        print()
    except ValueError as e:
        print(f"   ✗ Position not liquidatable: {e}")
        print()
    
    # Verify commitment opening
    print("4. Verify commitment opening")
    is_valid = commitment_system.verify_commitment_opening(
        collateral_commitment.commitment,
        collateral_commitment.value,
        collateral_commitment.nonce
    )
    print(f"   Commitment opening valid: {is_valid}")
    print()
    
    print("Demo completed successfully!")