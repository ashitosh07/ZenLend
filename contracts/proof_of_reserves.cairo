// SPDX-License-Identifier: MIT
// Bitcoin Proof-of-Reserves Verifier
// Verifies that sum(private_utxo_values) >= claimed_liability

#[starknet::interface]
trait IProofOfReserves<TContractState> {
    fn submit_proof(
        ref self: TContractState,
        custodian: felt252,
        claimed_liability: u128,
        utxo_sum: u128,
        proof_hash: felt252
    );
    fn get_verification_status(self: @TContractState, custodian: felt252) -> (bool, u128, u64);
}

#[starknet::contract]
mod ProofOfReserves {
    use starknet::get_block_timestamp;

    #[storage]
    struct Storage {
        // custodian -> (is_verified, claimed_liability, timestamp)
        verifications: LegacyMap<felt252, (bool, u128, u64)>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        ProofVerified: ProofVerified,
    }

    #[derive(Drop, starknet::Event)]
    struct ProofVerified {
        custodian: felt252,
        claimed_liability: u128,
        utxo_sum: u128,
        timestamp: u64,
    }

    #[abi(embed_v0)]
    impl ProofOfReservesImpl of super::IProofOfReserves<ContractState> {
        fn submit_proof(
            ref self: ContractState,
            custodian: felt252,
            claimed_liability: u128,
            utxo_sum: u128,
            proof_hash: felt252
        ) {
            // Core constraint: sum of UTXOs >= claimed liability
            assert(utxo_sum >= claimed_liability, 'Insufficient reserves');
            
            // In production, a ZK proof would enforce that utxo_sum
            // is derived from committed private UTXO values.
            // This PoC demonstrates on-chain verification flow and constraints.
            // The proof_hash represents the commitment to private UTXO values
            
            let timestamp = get_block_timestamp();
            let is_verified = true;
            
            self.verifications.write(custodian, (is_verified, claimed_liability, timestamp));
            
            self.emit(ProofVerified {
                custodian,
                claimed_liability,
                utxo_sum,
                timestamp
            });
        }

        fn get_verification_status(
            self: @ContractState,
            custodian: felt252
        ) -> (bool, u128, u64) {
            self.verifications.read(custodian)
        }
    }
}
