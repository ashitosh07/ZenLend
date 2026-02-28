#!/usr/bin/env python3
"""Fix Cairo contracts for Cairo 2.16 / OZ v3.0.0 compatibility"""

LENDING = r"""// SPDX-License-Identifier: MIT
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
"""

PUSD = r"""// SPDX-License-Identifier: MIT
// Private USD (PUSD) - Stablecoin backed by private BTC collateral

use starknet::ContractAddress;

#[starknet::interface]
trait IPrivateUSD<TContractState> {
    fn name(self: @TContractState) -> ByteArray;
    fn symbol(self: @TContractState) -> ByteArray;
    fn decimals(self: @TContractState) -> u8;
    fn total_supply(self: @TContractState) -> u256;
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
    fn allowance(self: @TContractState, owner: ContractAddress, spender: ContractAddress) -> u256;
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(ref self: TContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool;
    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
    fn mint(ref self: TContractState, to: ContractAddress, amount: u256);
    fn burn(ref self: TContractState, from: ContractAddress, amount: u256);
    fn set_lending_contract(ref self: TContractState, lending_contract: ContractAddress);
    fn get_lending_contract(self: @TContractState) -> ContractAddress;
}

#[starknet::contract]
mod PrivateUSD {
    use super::IPrivateUSD;
    use starknet::{ContractAddress, get_caller_address};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess, StorageMapReadAccess, StorageMapWriteAccess, Map};
    use openzeppelin::access::ownable::OwnableComponent;
    use core::num::traits::Zero;

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        name: ByteArray,
        symbol: ByteArray,
        decimals: u8,
        total_supply: u256,
        balances: Map<ContractAddress, u256>,
        allowances: Map<(ContractAddress, ContractAddress), u256>,
        lending_contract: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        Transfer: Transfer,
        Approval: Approval,
        Mint: Mint,
        Burn: Burn,
    }

    #[derive(Drop, starknet::Event)]
    struct Transfer { #[key] from: ContractAddress, #[key] to: ContractAddress, value: u256 }
    #[derive(Drop, starknet::Event)]
    struct Approval { #[key] owner: ContractAddress, #[key] spender: ContractAddress, value: u256 }
    #[derive(Drop, starknet::Event)]
    struct Mint { #[key] to: ContractAddress, value: u256 }
    #[derive(Drop, starknet::Event)]
    struct Burn { #[key] from: ContractAddress, value: u256 }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.ownable.initializer(owner);
        self.name.write("Private USD");
        self.symbol.write("PUSD");
        self.decimals.write(18);
        self.total_supply.write(0);
    }

    #[abi(embed_v0)]
    impl PrivateUSDImpl of IPrivateUSD<ContractState> {
        fn name(self: @ContractState) -> ByteArray { self.name.read() }
        fn symbol(self: @ContractState) -> ByteArray { self.symbol.read() }
        fn decimals(self: @ContractState) -> u8 { self.decimals.read() }
        fn total_supply(self: @ContractState) -> u256 { self.total_supply.read() }
        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 { self.balances.read(account) }
        fn allowance(self: @ContractState, owner: ContractAddress, spender: ContractAddress) -> u256 { self.allowances.read((owner, spender)) }

        fn transfer(ref self: ContractState, recipient: ContractAddress, amount: u256) -> bool {
            let sender = get_caller_address();
            self._transfer(sender, recipient, amount);
            true
        }

        fn transfer_from(ref self: ContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool {
            let caller = get_caller_address();
            let current_allowance = self.allowances.read((sender, caller));
            assert(current_allowance >= amount, 'Insufficient allowance');
            self.allowances.write((sender, caller), current_allowance - amount);
            self._transfer(sender, recipient, amount);
            true
        }

        fn approve(ref self: ContractState, spender: ContractAddress, amount: u256) -> bool {
            let owner = get_caller_address();
            self.allowances.write((owner, spender), amount);
            self.emit(Approval { owner, spender, value: amount });
            true
        }

        fn mint(ref self: ContractState, to: ContractAddress, amount: u256) {
            let caller = get_caller_address();
            assert(caller == self.lending_contract.read(), 'Only lending contract');
            self.balances.write(to, self.balances.read(to) + amount);
            self.total_supply.write(self.total_supply.read() + amount);
            self.emit(Mint { to, value: amount });
        }

        fn burn(ref self: ContractState, from: ContractAddress, amount: u256) {
            let caller = get_caller_address();
            assert(caller == self.lending_contract.read(), 'Only lending contract');
            let current_balance = self.balances.read(from);
            assert(current_balance >= amount, 'Insufficient balance');
            self.balances.write(from, current_balance - amount);
            self.total_supply.write(self.total_supply.read() - amount);
            self.emit(Burn { from, value: amount });
        }

        fn set_lending_contract(ref self: ContractState, lending_contract: ContractAddress) {
            self.ownable.assert_only_owner();
            self.lending_contract.write(lending_contract);
        }

        fn get_lending_contract(self: @ContractState) -> ContractAddress { self.lending_contract.read() }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _transfer(ref self: ContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256) {
            assert(sender.is_non_zero(), 'Transfer from zero address');
            assert(recipient.is_non_zero(), 'Transfer to zero address');
            let sender_balance = self.balances.read(sender);
            assert(sender_balance >= amount, 'Insufficient balance');
            self.balances.write(sender, sender_balance - amount);
            self.balances.write(recipient, self.balances.read(recipient) + amount);
            self.emit(Transfer { from: sender, to: recipient, value: amount });
        }
    }
}
"""

with open('c:/Personal/Starknet/src/private_btc_lending.cairo', 'w') as f:
    f.write(LENDING)
with open('c:/Personal/Starknet/src/private_usd.cairo', 'w') as f:
    f.write(PUSD)
# Also update the contracts/ folder copies
with open('c:/Personal/Starknet/contracts/private_btc_lending.cairo', 'w') as f:
    f.write(LENDING)
with open('c:/Personal/Starknet/contracts/private_usd.cairo', 'w') as f:
    f.write(PUSD)

print("All 4 files written successfully")
