// SPDX-License-Identifier: MIT
// Private USD (PUSD) - Stablecoin backed by private BTC collateral

use starknet::ContractAddress;

#[starknet::interface]
trait IPrivateUSD<TContractState> {
    // ERC20 Standard Functions
    fn name(self: @TContractState) -> ByteArray;
    fn symbol(self: @TContractState) -> ByteArray;
    fn decimals(self: @TContractState) -> u8;
    fn total_supply(self: @TContractState) -> u256;
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
    fn allowance(self: @TContractState, owner: ContractAddress, spender: ContractAddress) -> u256;
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: TContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256
    ) -> bool;
    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
    
    // Minting Functions (restricted to lending contract)
    fn mint(ref self: TContractState, to: ContractAddress, amount: u256);
    fn burn(ref self: TContractState, from: ContractAddress, amount: u256);
    
    // Admin Functions
    fn set_lending_contract(ref self: TContractState, lending_contract: ContractAddress);
    fn get_lending_contract(self: @TContractState) -> ContractAddress;
}

#[starknet::contract]
mod PrivateUSD {
    use super::IPrivateUSD;
    use starknet::{ContractAddress, get_caller_address};
    use openzeppelin::access::ownable::OwnableComponent;
    
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    
    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;
    
    #[storage]
    struct Storage {
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        
        // ERC20 Storage
        name: ByteArray,
        symbol: ByteArray,
        decimals: u8,
        total_supply: u256,
        balances: LegacyMap<ContractAddress, u256>,
        allowances: LegacyMap<(ContractAddress, ContractAddress), u256>,
        
        // Lending contract authorization
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
    struct Transfer {
        #[key]
        from: ContractAddress,
        #[key]
        to: ContractAddress,
        value: u256,
    }
    
    #[derive(Drop, starknet::Event)]
    struct Approval {
        #[key]
        owner: ContractAddress,
        #[key]
        spender: ContractAddress,
        value: u256,
    }
    
    #[derive(Drop, starknet::Event)]
    struct Mint {
        #[key]
        to: ContractAddress,
        value: u256,
    }
    
    #[derive(Drop, starknet::Event)]
    struct Burn {
        #[key]
        from: ContractAddress,
        value: u256,
    }
    
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
        // ERC20 Standard Implementation
        fn name(self: @ContractState) -> ByteArray {
            self.name.read()
        }
        
        fn symbol(self: @ContractState) -> ByteArray {
            self.symbol.read()
        }
        
        fn decimals(self: @ContractState) -> u8 {
            self.decimals.read()
        }
        
        fn total_supply(self: @ContractState) -> u256 {
            self.total_supply.read()
        }
        
        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
            self.balances.read(account)
        }
        
        fn allowance(
            self: @ContractState, 
            owner: ContractAddress, 
            spender: ContractAddress
        ) -> u256 {
            self.allowances.read((owner, spender))
        }
        
        fn transfer(
            ref self: ContractState, 
            recipient: ContractAddress, 
            amount: u256
        ) -> bool {
            let sender = get_caller_address();
            self._transfer(sender, recipient, amount);
            true
        }
        
        fn transfer_from(
            ref self: ContractState,
            sender: ContractAddress,
            recipient: ContractAddress,
            amount: u256
        ) -> bool {
            let caller = get_caller_address();
            let current_allowance = self.allowances.read((sender, caller));
            
            assert(current_allowance >= amount, 'Insufficient allowance');
            
            self.allowances.write((sender, caller), current_allowance - amount);
            self._transfer(sender, recipient, amount);
            true
        }
        
        fn approve(
            ref self: ContractState, 
            spender: ContractAddress, 
            amount: u256
        ) -> bool {
            let owner = get_caller_address();
            self.allowances.write((owner, spender), amount);
            
            self.emit(Approval { owner, spender, value: amount });
            true
        }
        
        // Minting Functions
        fn mint(ref self: ContractState, to: ContractAddress, amount: u256) {
            // Only lending contract can mint
            let caller = get_caller_address();
            let lending_contract = self.lending_contract.read();
            assert(caller == lending_contract, 'Only lending contract can mint');
            
            let new_balance = self.balances.read(to) + amount;
            self.balances.write(to, new_balance);
            
            let new_total_supply = self.total_supply.read() + amount;
            self.total_supply.write(new_total_supply);
            
            self.emit(Mint { to, value: amount });
            self.emit(Transfer { 
                from: starknet::contract_address_const::<0>(), 
                to, 
                value: amount 
            });
        }
        
        fn burn(ref self: ContractState, from: ContractAddress, amount: u256) {
            // Only lending contract can burn
            let caller = get_caller_address();
            let lending_contract = self.lending_contract.read();
            assert(caller == lending_contract, 'Only lending contract can burn');
            
            let current_balance = self.balances.read(from);
            assert(current_balance >= amount, 'Insufficient balance to burn');
            
            self.balances.write(from, current_balance - amount);
            
            let new_total_supply = self.total_supply.read() - amount;
            self.total_supply.write(new_total_supply);
            
            self.emit(Burn { from, value: amount });
            self.emit(Transfer { 
                from, 
                to: starknet::contract_address_const::<0>(), 
                value: amount 
            });
        }
        
        // Admin Functions
        fn set_lending_contract(ref self: ContractState, lending_contract: ContractAddress) {
            self.ownable.assert_only_owner();
            self.lending_contract.write(lending_contract);
        }
        
        fn get_lending_contract(self: @ContractState) -> ContractAddress {
            self.lending_contract.read()
        }
    }
    
    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _transfer(
            ref self: ContractState,
            sender: ContractAddress,
            recipient: ContractAddress,
            amount: u256
        ) {
            assert(!sender.is_zero(), 'Transfer from zero address');
            assert(!recipient.is_zero(), 'Transfer to zero address');
            
            let sender_balance = self.balances.read(sender);
            assert(sender_balance >= amount, 'Insufficient balance');
            
            self.balances.write(sender, sender_balance - amount);
            
            let recipient_balance = self.balances.read(recipient);
            self.balances.write(recipient, recipient_balance + amount);
            
            self.emit(Transfer { from: sender, to: recipient, value: amount });
        }
    }
}