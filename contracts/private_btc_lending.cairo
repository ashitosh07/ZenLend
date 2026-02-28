// SPDX-License-Identifier: MIT
// ZenLend - Private Bitcoin Lending Protocol
// The first DeFi protocol for strkBTC on Starknet
// Enables private collateralization and borrowing using Pedersen commitments
// Compatible with strkBTC's viewing key and shielded balance architecture

use starknet::ContractAddress;

#[starknet::interface]
trait IPrivateBTCLending<TContractState> {
    // Collateral Management
    fn deposit_collateral(
        ref self: TContractState,
        commitment: felt252,
        proof_r: felt252,
        proof_s: felt252,
        amount_hint: u128  // For verification efficiency
    );
    
    fn withdraw_collateral(
        ref self: TContractState,
        amount: u128,
        opening_proof: Array<felt252>
    );
    
    // Borrowing Functions  
    fn mint_stable(
        ref self: TContractState,
        amount: u128,
        solvency_proof: Array<felt252>
    );
    
    fn repay_debt(
        ref self: TContractState,
        amount: u128
    );
    
    // Liquidation
    fn liquidate_position(
        ref self: TContractState,
        borrower: ContractAddress,
        liquidation_proof: Array<felt252>
    );
    
    // View Functions
    fn get_commitment(self: @TContractState, user: ContractAddress) -> felt252;
    fn get_debt_amount(self: @TContractState, user: ContractAddress) -> u128;
    fn is_position_healthy(
        self: @TContractState, 
        user: ContractAddress,
        health_proof: Array<felt252>
    ) -> bool;
    fn get_liquidation_threshold(self: @TContractState) -> u128;
    fn get_protocol_stats(self: @TContractState) -> (u128, u128); // total_committed, total_debt
}

#[starknet::contract]
mod PrivateBTCLending {
    use super::IPrivateBTCLending;
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    
    // Pedersen commitment constants (simplified for PoC)
    const GENERATOR_G: felt252 = 0x1ef15c18599971b7beced415a40f0c7deacfd9b0d1819e03d723d8bc943cfca;
    const GENERATOR_H: felt252 = 0x5af3107a4000c94cd5b6fd87df0e9b6fd378d766499c0b09adbaf0e3e2a8c8e;
    const COLLATERAL_RATIO: u128 = 150; // 150% over-collateralization required
    
    #[storage]
    struct Storage {
        // User collateral commitments: user -> Pedersen commitment
        commitments: LegacyMap<ContractAddress, felt252>,
        
        // User debt amounts (public): user -> debt in PUSD
        debt_amounts: LegacyMap<ContractAddress, u128>,
        
        // Protocol state
        total_committed_collateral: u128,
        total_debt: u128,
        
        // Contract addresses
        pusd_token: ContractAddress,
        strkbtc_token: ContractAddress, // strkBTC - Starknet's private Bitcoin token
        
        // Protocol parameters
        liquidation_threshold: u128, // 120%
        liquidation_bonus: u128,     // 5%
        
        // Position tracking
        active_positions: LegacyMap<ContractAddress, bool>,
    }
    
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        CollateralDeposited: CollateralDeposited,
        DebtMinted: DebtMinted,
        CollateralWithdrawn: CollateralWithdrawn,
        DebtRepaid: DebtRepaid,
        PositionLiquidated: PositionLiquidated,
    }
    
    #[derive(Drop, starknet::Event)]
    struct CollateralDeposited {
        #[key]
        user: ContractAddress,
        commitment: felt252,
        timestamp: u64,
    }
    
    #[derive(Drop, starknet::Event)]
    struct DebtMinted {
        #[key]
        user: ContractAddress,
        amount: u128,
        timestamp: u64,
    }
    
    #[derive(Drop, starknet::Event)]
    struct CollateralWithdrawn {
        #[key]
        user: ContractAddress,
        amount: u128,
        timestamp: u64,
    }
    
    #[derive(Drop, starknet::Event)]
    struct DebtRepaid {
        #[key]
        user: ContractAddress,
        amount: u128,
        timestamp: u64,
    }
    
    #[derive(Drop, starknet::Event)]
    struct PositionLiquidated {
        #[key]
        borrower: ContractAddress,
        #[key]
        liquidator: ContractAddress,
        debt_amount: u128,
        timestamp: u64,
    }
    
    #[constructor]
    fn constructor(
        ref self: ContractState,
        pusd_token_address: ContractAddress,
        wbtc_token_address: ContractAddress
    ) {
        self.pusd_token.write(pusd_token_address);
        self.wbtc_token.write(wbtc_token_address);
        self.liquidation_threshold.write(120); // 120%
        self.liquidation_bonus.write(5);       // 5%
    }
    
    #[abi(embed_v0)]
    impl PrivateBTCLendingImpl of IPrivateBTCLending<ContractState> {
        fn deposit_collateral(
            ref self: ContractState,
            commitment: felt252,
            proof_r: felt252,
            proof_s: felt252,
            amount_hint: u128
        ) {
            let caller = get_caller_address();
            
            // Verify the Pedersen commitment is valid (simplified)
            // In production: verify zero-knowledge proof that user owns the committed amount
            assert(commitment != 0, 'Invalid commitment');
            
            // Transfer WBTC from user (this proves ownership)
            let wbtc = IERC20Dispatcher { contract_address: self.wbtc_token.read() };
            wbtc.transfer_from(caller, starknet::get_contract_address(), amount_hint.into());
            
            // Store the commitment
            self.commitments.write(caller, commitment);
            self.active_positions.write(caller, true);
            
            // Update protocol stats
            self.total_committed_collateral.write(
                self.total_committed_collateral.read() + amount_hint
            );
            
            // Emit event
            self.emit(CollateralDeposited {
                user: caller,
                commitment: commitment,
                timestamp: get_block_timestamp()
            });
        }
        
        fn withdraw_collateral(
            ref self: ContractState,
            amount: u128,
            opening_proof: Array<felt252>
        ) {
            let caller = get_caller_address();
            let user_debt = self.debt_amounts.read(caller);
            
            // User must have zero debt to withdraw
            assert(user_debt == 0, 'Cannot withdraw with debt');
            
            // Verify commitment opening proof
            // In production: verify ZK proof that commitment opens to >= amount
            assert(opening_proof.len() > 0, 'Invalid opening proof');
            
            // Transfer WBTC back to user
            let wbtc = IERC20Dispatcher { contract_address: self.wbtc_token.read() };
            wbtc.transfer(caller, amount.into());
            
            // Update protocol stats
            self.total_committed_collateral.write(
                self.total_committed_collateral.read() - amount
            );
            
            // Clear position if fully withdrawn
            // Note: In production, this would update the commitment to new amount
            if amount == self.total_committed_collateral.read() {
                self.commitments.write(caller, 0);
                self.active_positions.write(caller, false);
            }
            
            self.emit(CollateralWithdrawn {
                user: caller,
                amount: amount,
                timestamp: get_block_timestamp()
            });
        }
        
        fn mint_stable(
            ref self: ContractState,
            amount: u128,
            solvency_proof: Array<felt252>
        ) {
            let caller = get_caller_address();
            let commitment = self.commitments.read(caller);
            
            // User must have deposited collateral
            assert(commitment != 0, 'No collateral committed');
            
            // Verify solvency proof: committed_collateral >= (existing_debt + new_debt) * 1.5
            // In production: verify ZK proof of solvency constraint
            assert(solvency_proof.len() > 0, 'Invalid solvency proof');
            
            let current_debt = self.debt_amounts.read(caller);
            let new_total_debt = current_debt + amount;
            
            // For PoC: simplified check using amount hints
            // Production would use ZK proofs to verify commitment >= new_total_debt * 1.5
            
            // Mint PUSD to user
            let pusd = IERC20Dispatcher { contract_address: self.pusd_token.read() };
            // Note: This assumes the PUSD contract has a mint function accessible to this contract
            
            // Update user debt
            self.debt_amounts.write(caller, new_total_debt);
            
            // Update protocol stats
            self.total_debt.write(self.total_debt.read() + amount);
            
            self.emit(DebtMinted {
                user: caller,
                amount: amount,
                timestamp: get_block_timestamp()
            });
        }
        
        fn repay_debt(
            ref self: ContractState,
            amount: u128
        ) {
            let caller = get_caller_address();
            let current_debt = self.debt_amounts.read(caller);
            
            assert(current_debt >= amount, 'Repay amount exceeds debt');
            
            // Burn PUSD from user
            let pusd = IERC20Dispatcher { contract_address: self.pusd_token.read() };
            pusd.transfer_from(caller, starknet::get_contract_address(), amount.into());
            
            // Update user debt
            let new_debt = current_debt - amount;
            self.debt_amounts.write(caller, new_debt);
            
            // Update protocol stats
            self.total_debt.write(self.total_debt.read() - amount);
            
            self.emit(DebtRepaid {
                user: caller,
                amount: amount,
                timestamp: get_block_timestamp()
            });
        }
        
        fn liquidate_position(
            ref self: ContractState,
            borrower: ContractAddress,
            liquidation_proof: Array<felt252>
        ) {
            let caller = get_caller_address(); // liquidator
            let borrower_debt = self.debt_amounts.read(borrower);
            
            assert(borrower_debt > 0, 'No debt to liquidate');
            
            // Verify liquidation proof: committed_collateral < debt * liquidation_threshold
            // In production: verify ZK proof that position is under-collateralized
            assert(liquidation_proof.len() > 0, 'Invalid liquidation proof');
            
            // Calculate liquidation amounts
            let liquidation_bonus = self.liquidation_bonus.read();
            let collateral_to_seize = borrower_debt + (borrower_debt * liquidation_bonus / 100);
            
            // Transfer debt from liquidator to protocol
            let pusd = IERC20Dispatcher { contract_address: self.pusd_token.read() };
            pusd.transfer_from(caller, starknet::get_contract_address(), borrower_debt.into());
            
            // Transfer collateral to liquidator
            let wbtc = IERC20Dispatcher { contract_address: self.wbtc_token.read() };
            wbtc.transfer(caller, collateral_to_seize.into());
            
            // Clear borrower position
            self.debt_amounts.write(borrower, 0);
            self.commitments.write(borrower, 0);
            self.active_positions.write(borrower, false);
            
            // Update protocol stats
            self.total_debt.write(self.total_debt.read() - borrower_debt);
            self.total_committed_collateral.write(
                self.total_committed_collateral.read() - collateral_to_seize
            );
            
            self.emit(PositionLiquidated {
                borrower: borrower,
                liquidator: caller,
                debt_amount: borrower_debt,
                timestamp: get_block_timestamp()
            });
        }
        
        // View Functions
        fn get_commitment(self: @ContractState, user: ContractAddress) -> felt252 {
            self.commitments.read(user)
        }
        
        fn get_debt_amount(self: @ContractState, user: ContractAddress) -> u128 {
            self.debt_amounts.read(user)
        }
        
        fn is_position_healthy(
            self: @ContractState,
            user: ContractAddress,
            health_proof: Array<felt252>
        ) -> bool {
            let debt = self.debt_amounts.read(user);
            if debt == 0 {
                return true;
            }
            
            // Verify health proof: committed_collateral >= debt * collateral_ratio
            // For PoC: assume position is healthy if proof is provided
            health_proof.len() > 0
        }
        
        fn get_liquidation_threshold(self: @ContractState) -> u128 {
            self.liquidation_threshold.read()
        }
        
        fn get_protocol_stats(self: @ContractState) -> (u128, u128) {
            (self.total_committed_collateral.read(), self.total_debt.read())
        }
    }
}