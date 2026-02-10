"""
Test script demonstrating both solvent and insolvent scenarios
"""

from generator import ProofGenerator


def test_solvent_scenario():
    """Test case: Custodian has sufficient reserves"""
    print("=== TEST 1: Solvent Custodian ===\n")
    
    utxos = [50_000_000, 75_000_000, 100_000_000]  # 2.25 BTC
    liability = 200_000_000  # 2.0 BTC
    
    prover = ProofGenerator(utxos)
    proof = prover.generate_proof(liability)
    
    print(f"UTXOs: {[v/1e8 for v in utxos]} BTC")
    print(f"Sum: {sum(utxos)/1e8} BTC")
    print(f"Liability: {liability/1e8} BTC")
    print(f"Result: PASS - Solvent\n")


def test_insolvent_scenario():
    """Test case: Custodian has insufficient reserves"""
    print("=== TEST 2: Insolvent Custodian ===\n")
    
    utxos = [50_000_000, 75_000_000]  # 1.25 BTC
    liability = 200_000_000  # 2.0 BTC
    
    prover = ProofGenerator(utxos)
    
    print(f"UTXOs: {[v/1e8 for v in utxos]} BTC")
    print(f"Sum: {sum(utxos)/1e8} BTC")
    print(f"Liability: {liability/1e8} BTC")
    
    try:
        proof = prover.generate_proof(liability)
        print(f"Result: FAIL - Should have been rejected\n")
    except AssertionError as e:
        print(f"Result: PASS - Correctly rejected ({e})\n")


def test_edge_case():
    """Test case: Exact match"""
    print("=== TEST 3: Exact Match ===\n")
    
    utxos = [200_000_000]  # 2.0 BTC
    liability = 200_000_000  # 2.0 BTC
    
    prover = ProofGenerator(utxos)
    proof = prover.generate_proof(liability)
    
    print(f"UTXOs: {[v/1e8 for v in utxos]} BTC")
    print(f"Sum: {sum(utxos)/1e8} BTC")
    print(f"Liability: {liability/1e8} BTC")
    print(f"Result: PASS - Solvent (edge case)\n")


if __name__ == "__main__":
    test_solvent_scenario()
    test_insolvent_scenario()
    test_edge_case()
    print("All tests completed.")
