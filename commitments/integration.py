"""
Integration utilities for connecting Python commitment system to Cairo contracts
"""

import json
from typing import Dict, List, Any
from .pedersen import PedersenCommitmentSystem, Commitment, btc_to_satoshis

class ZenLendIntegration:
    """
    Integration layer between Python commitment system and Cairo contracts
    
    Provides utilities for:
    - Converting Python proofs to Cairo-compatible format
    - Generating transaction parameters
    - Formatting contract call data
    """
    
    def __init__(self):
        self.commitment_system = PedersenCommitmentSystem()
        self.user_commitments: Dict[str, Commitment] = {}
    
    def prepare_deposit_transaction(self, user_address: str, btc_amount: float) -> Dict[str, Any]:
        """
        Prepare transaction data for depositing BTC collateral
        
        Args:
            user_address: User's Starknet address
            btc_amount: Amount of BTC to deposit
            
        Returns:
            Transaction parameters for Cairo contract call
        """
        # Generate commitment
        commitment = self.commitment_system.commit_btc_amount(btc_amount)
        self.user_commitments[user_address] = commitment
        
        # Convert to Cairo felt252 format
        commitment_felt = hex(commitment.commitment)
        proof_r = hex(commitment.nonce)  # Simplified proof
        proof_s = hex(commitment.value)  # Simplified proof
        amount_hint = btc_to_satoshis(btc_amount)
        
        return {
            "function_name": "deposit_collateral",
            "calldata": [
                commitment_felt,
                proof_r,
                proof_s,
                str(amount_hint)
            ],
            "commitment_data": {
                "value": commitment.value,
                "nonce": commitment.nonce,
                "commitment": commitment.commitment
            }
        }
    
    def prepare_mint_transaction(
        self, 
        user_address: str, 
        pusd_amount: float,
        collateral_ratio: float = 1.5
    ) -> Dict[str, Any]:
        """
        Prepare transaction data for minting PUSD against collateral
        
        Args:
            user_address: User's Starknet address
            pusd_amount: Amount of PUSD to mint
            collateral_ratio: Required collateralization ratio
            
        Returns:
            Transaction parameters for Cairo contract call
        """
        if user_address not in self.user_commitments:
            raise ValueError("No collateral commitment found for user")
        
        commitment = self.user_commitments[user_address]
        
        # Generate solvency proof
        solvency_proof = self.commitment_system.generate_solvency_proof(
            commitment,
            pusd_amount,
            collateral_ratio
        )
        
        # Convert to Cairo format
        mint_amount = int(pusd_amount * 1e18)  # ERC20 decimals
        
        return {
            "function_name": "mint_stable",
            "calldata": [
                str(mint_amount),
                json.dumps(solvency_proof["proof_elements"])
            ],
            "proof_data": solvency_proof
        }
    
    def prepare_liquidation_transaction(
        self,
        liquidator_address: str,
        borrower_address: str,
        debt_amount: float
    ) -> Dict[str, Any]:
        """
        Prepare transaction data for liquidating an under-collateralized position
        
        Args:
            liquidator_address: Liquidator's address
            borrower_address: Borrower's address to liquidate
            debt_amount: Current debt amount
            
        Returns:
            Transaction parameters for liquidation
        """
        if borrower_address not in self.user_commitments:
            raise ValueError("No commitment found for borrower")
        
        commitment = self.user_commitments[borrower_address]
        
        # Generate liquidation proof
        liquidation_proof = self.commitment_system.generate_liquidation_proof(
            commitment,
            debt_amount,
            liquidation_threshold=1.2
        )
        
        return {
            "function_name": "liquidate_position",
            "calldata": [
                borrower_address,
                json.dumps(liquidation_proof["proof_elements"])
            ],
            "proof_data": liquidation_proof
        }
    
    def verify_position_health(self, user_address: str, debt_amount: float) -> Dict[str, Any]:
        """
        Check if a position is healthy (properly collateralized)
        
        Args:
            user_address: User's address
            debt_amount: Current debt amount
            
        Returns:
            Health status and proof data
        """
        if user_address not in self.user_commitments:
            return {"healthy": False, "reason": "No collateral found"}
        
        commitment = self.user_commitments[user_address]
        debt_satoshis = btc_to_satoshis(debt_amount)
        required_collateral = int(debt_satoshis * 1.5)  # 150% ratio
        
        is_healthy = commitment.value >= required_collateral
        
        return {
            "healthy": is_healthy,
            "collateral_value": commitment.value,
            "debt_value": debt_satoshis,
            "required_collateral": required_collateral,
            "collateral_ratio": (commitment.value / debt_satoshis) if debt_satoshis > 0 else float('inf')
        }
    
    def get_user_commitment(self, user_address: str) -> Dict[str, Any]:
        """Get commitment data for a user"""
        if user_address not in self.user_commitments:
            return None
        
        commitment = self.user_commitments[user_address]
        return {
            "commitment": hex(commitment.commitment),
            "value_btc": commitment.value / 1e8,
            "value_satoshis": commitment.value,
            "has_position": True
        }


def format_cairo_calldata(calldata: List[str]) -> str:
    """
    Format calldata for Cairo contract calls
    
    Args:
        calldata: List of parameter strings
        
    Returns:
        Formatted calldata string
    """
    return " ".join(calldata)


def parse_cairo_event(event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parse events emitted from Cairo contracts
    
    Args:
        event_data: Raw event data from Starknet
        
    Returns:
        Parsed event information
    """
    # This would parse actual Starknet event data
    # For now, return a placeholder structure
    return {
        "event_type": event_data.get("event_name", "unknown"),
        "user": event_data.get("user", ""),
        "amount": event_data.get("amount", 0),
        "timestamp": event_data.get("timestamp", 0)
    }


# Example usage and testing
if __name__ == "__main__":
    print("=== ZenLend Integration Demo ===\n")
    
    integration = ZenLendIntegration()
    user_addr = "0x123456789abcdef"
    
    # 1. Deposit BTC collateral
    print("1. Preparing BTC deposit transaction")
    deposit_tx = integration.prepare_deposit_transaction(user_addr, 2.0)
    print(f"   Function: {deposit_tx['function_name']}")
    print(f"   Commitment: {deposit_tx['calldata'][0]}")
    print(f"   Amount hint: {deposit_tx['calldata'][3]} satoshis")
    print()
    
    # 2. Mint PUSD against collateral
    print("2. Preparing PUSD mint transaction")
    try:
        mint_tx = integration.prepare_mint_transaction(user_addr, 1.0)
        print(f"   Function: {mint_tx['function_name']}")
        print(f"   Mint amount: {mint_tx['calldata'][0]}")
        print(f"   Proof components: {len(json.loads(mint_tx['calldata'][1]))} elements")
        print()
    except ValueError as e:
        print(f"   Error: {e}")
        print()
    
    # 3. Check position health
    print("3. Checking position health")
    health = integration.verify_position_health(user_addr, 1.0)
    print(f"   Healthy: {health['healthy']}")
    print(f"   Collateral ratio: {health['collateral_ratio']:.2f}x")
    print(f"   Required: {health['required_collateral']} satoshis")
    print()
    
    # 4. Get user commitment
    print("4. User commitment info")
    commitment_info = integration.get_user_commitment(user_addr)
    if commitment_info:
        print(f"   Commitment: {commitment_info['commitment']}")
        print(f"   Value: {commitment_info['value_btc']} BTC")
        print(f"   Has position: {commitment_info['has_position']}")
    
    print("\nIntegration demo completed!")