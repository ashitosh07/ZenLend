// SPDX-License-Identifier: MIT
// ZenLend - Private Bitcoin Lending Protocol

use starknet::ContractAddress;

// Minimal ERC20 interface for cross-contract calls
#[starknet::interface]
trait IERC20Extern<TState> {
    fn transfer(ref self: TState, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(ref self: TState, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool;
}

#[starknet::interface]
trait IPrivateBTCLending<TContractState> {
    fn deposit_collateral(ref self: TContractState, commitment: felt252, proof_r: felt252, proof_s: felt252, amount_hint: u128);
    fn withdraw_collateral(ref self: TContractState, amount: u128, opening_proof: Array<felt252>);
    fn mint_stable(ref self: TContractState, amount: u128, solvency_proof: Array<felt252>);
    fn repay_debt(ref self: TContractState, amount: u128);
    fn liquidate_position(ref self: TContractState, borrower: ContractAddress, liquidation_proof: Array<felt252>);
    fn get_commitment(self: @TContractState, user: ContractAddress) -> felt252;
    fn get_debt_amount(self: @TContractState, user: ContractAddress) -> u128;
    fn is_position_healthy(self: @TContractState, user: ContractAddress, health_proof: Array<felt252>) -> bool;
    fn get_liquidation_threshold(self: @TContractState) -> u128;
    fn get_protocol_stats(self: @TContractState) -> (u128, u128);
}

#[starknet::contract]
mod PrivateBTCLending {
    use super::IPrivateBTCLending;
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp, get_contract_address};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess, StorageMapReadAccess, StorageMapWriteAccess, Map};
    use super::{IERC20ExternDispatcher, IERC20ExternDispatcherTrait};

    #[storage]
    struct Storage {
        commitments: Map<ContractAddress, felt252>,
        debt_amounts: Map<ContractAddress, u128>,
        total_committed_collateral: u128,
        total_debt: u128,
        pusd_token: ContractAddress,
        strkbtc_token: ContractAddress,
        liquidation_threshold: u128,
        liquidation_bonus: u128,
        active_positions: Map<ContractAddress, bool>,
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
    struct CollateralDeposited { #[key] user: ContractAddress, commitment: felt252, timestamp: u64 }
    #[derive(Drop, starknet::Event)]
    struct DebtMinted { #[key] user: ContractAddress, amount: u128, timestamp: u64 }
    #[derive(Drop, starknet::Event)]
    struct CollateralWithdrawn { #[key] user: ContractAddress, amount: u128, timestamp: u64 }
    #[derive(Drop, starknet::Event)]
    struct DebtRepaid { #[key] user: ContractAddress, amount: u128, timestamp: u64 }
    #[derive(Drop, starknet::Event)]
    struct PositionLiquidated { #[key] borrower: ContractAddress, #[key] liquidator: ContractAddress, debt_amount: u128, timestamp: u64 }

    #[constructor]
    fn constructor(ref self: ContractState, pusd_token_address: ContractAddress, strkbtc_token_address: ContractAddress) {
        self.pusd_token.write(pusd_token_address);
        self.strkbtc_token.write(strkbtc_token_address);
        self.liquidation_threshold.write(120);
        self.liquidation_bonus.write(5);
    }

    #[abi(embed_v0)]
    impl PrivateBTCLendingImpl of IPrivateBTCLending<ContractState> {
        fn deposit_collateral(ref self: ContractState, commitment: felt252, proof_r: felt252, proof_s: felt252, amount_hint: u128) {
            let caller = get_caller_address();
            assert(commitment != 0, 'Invalid commitment');
            let strkbtc = IERC20ExternDispatcher { contract_address: self.strkbtc_token.read() };
            strkbtc.transfer_from(caller, get_contract_address(), u256 { low: amount_hint, high: 0 });
            self.commitments.write(caller, commitment);
            self.active_positions.write(caller, true);
            self.total_committed_collateral.write(self.total_committed_collateral.read() + amount_hint);
            self.emit(CollateralDeposited { user: caller, commitment, timestamp: get_block_timestamp() });
        }

        fn withdraw_collateral(ref self: ContractState, amount: u128, opening_proof: Array<felt252>) {
            let caller = get_caller_address();
            assert(self.debt_amounts.read(caller) == 0, 'Cannot withdraw with debt');
            assert(opening_proof.len() > 0, 'Invalid opening proof');
            let strkbtc = IERC20ExternDispatcher { contract_address: self.strkbtc_token.read() };
            strkbtc.transfer(caller, u256 { low: amount, high: 0 });
            let prev = self.total_committed_collateral.read();
            self.total_committed_collateral.write(prev - amount);
            if amount == prev { self.commitments.write(caller, 0); self.active_positions.write(caller, false); }
            self.emit(CollateralWithdrawn { user: caller, amount, timestamp: get_block_timestamp() });
        }

        fn mint_stable(ref self: ContractState, amount: u128, solvency_proof: Array<felt252>) {
            let caller = get_caller_address();
            assert(self.commitments.read(caller) != 0, 'No collateral committed');
            assert(solvency_proof.len() > 0, 'Invalid solvency proof');
            let current_debt = self.debt_amounts.read(caller);
            self.debt_amounts.write(caller, current_debt + amount);
            self.total_debt.write(self.total_debt.read() + amount);
            self.emit(DebtMinted { user: caller, amount, timestamp: get_block_timestamp() });
        }

        fn repay_debt(ref self: ContractState, amount: u128) {
            let caller = get_caller_address();
            let current_debt = self.debt_amounts.read(caller);
            assert(current_debt >= amount, 'Repay amount exceeds debt');
            let pusd = IERC20ExternDispatcher { contract_address: self.pusd_token.read() };
            pusd.transfer_from(caller, get_contract_address(), u256 { low: amount, high: 0 });
            self.debt_amounts.write(caller, current_debt - amount);
            self.total_debt.write(self.total_debt.read() - amount);
            self.emit(DebtRepaid { user: caller, amount, timestamp: get_block_timestamp() });
        }

        fn liquidate_position(ref self: ContractState, borrower: ContractAddress, liquidation_proof: Array<felt252>) {
            let caller = get_caller_address();
            let borrower_debt = self.debt_amounts.read(borrower);
            assert(borrower_debt > 0, 'No debt to liquidate');
            assert(liquidation_proof.len() > 0, 'Invalid liquidation proof');
            let bonus = self.liquidation_bonus.read();
            let collateral_to_seize = borrower_debt + (borrower_debt * bonus / 100);
            let pusd = IERC20ExternDispatcher { contract_address: self.pusd_token.read() };
            pusd.transfer_from(caller, get_contract_address(), u256 { low: borrower_debt, high: 0 });
            let strkbtc = IERC20ExternDispatcher { contract_address: self.strkbtc_token.read() };
            strkbtc.transfer(caller, u256 { low: collateral_to_seize, high: 0 });
            self.debt_amounts.write(borrower, 0);
            self.commitments.write(borrower, 0);
            self.active_positions.write(borrower, false);
            self.total_debt.write(self.total_debt.read() - borrower_debt);
            self.total_committed_collateral.write(self.total_committed_collateral.read() - collateral_to_seize);
            self.emit(PositionLiquidated { borrower, liquidator: caller, debt_amount: borrower_debt, timestamp: get_block_timestamp() });
        }

        fn get_commitment(self: @ContractState, user: ContractAddress) -> felt252 { self.commitments.read(user) }
        fn get_debt_amount(self: @ContractState, user: ContractAddress) -> u128 { self.debt_amounts.read(user) }
        fn is_position_healthy(self: @ContractState, user: ContractAddress, health_proof: Array<felt252>) -> bool {
            if self.debt_amounts.read(user) == 0 { return true; }
            health_proof.len() > 0
        }
        fn get_liquidation_threshold(self: @ContractState) -> u128 { self.liquidation_threshold.read() }
        fn get_protocol_stats(self: @ContractState) -> (u128, u128) {
            (self.total_committed_collateral.read(), self.total_debt.read())
        }
    }
}
