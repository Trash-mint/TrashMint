#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol};

#[contracttype]
pub enum DataKey {
    Balance(Address),
    Allowance(Address, Address),
    Admin,
    Minter,
    TotalSupply,
    Decimals,
    Name,
    Symbol,
}

#[contract]
pub struct MintToken;

#[contractimpl]
impl MintToken {
    pub fn initialize(env: Env, admin: Address, minter: Address, decimals: u32, name: String, symbol: String) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Minter, &minter);
        env.storage().instance().set(&DataKey::Decimals, &decimals);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().set(&DataKey::TotalSupply, &0i128);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let minter: Address = env.storage().instance().get(&DataKey::Minter).expect("not initialized");
        minter.require_auth();
        assert!(amount > 0, "amount must be positive");
        let bal = Self::balance(env.clone(), to.clone());
        env.storage().persistent().set(&DataKey::Balance(to.clone()), &(bal + amount));
        let supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalSupply, &(supply + amount));
        env.events().publish((Symbol::new(&env, "mint"),), (to, amount));
    }

    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();
        let bal = Self::balance(env.clone(), from.clone());
        assert!(bal >= amount, "insufficient balance");
        env.storage().persistent().set(&DataKey::Balance(from.clone()), &(bal - amount));
        let supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalSupply, &(supply - amount));
        env.events().publish((Symbol::new(&env, "burn"),), (from, amount));
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        let from_bal = Self::balance(env.clone(), from.clone());
        assert!(from_bal >= amount, "insufficient balance");
        env.storage().persistent().set(&DataKey::Balance(from.clone()), &(from_bal - amount));
        let to_bal = Self::balance(env.clone(), to.clone());
        env.storage().persistent().set(&DataKey::Balance(to.clone()), &(to_bal + amount));
        env.events().publish((Symbol::new(&env, "transfer"),), (from, to, amount));
    }

    pub fn balance(env: Env, account: Address) -> i128 {
        env.storage().persistent().get(&DataKey::Balance(account)).unwrap_or(0)
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0)
    }

    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Decimals).unwrap_or(7)
    }

    pub fn name(env: Env) -> String {
        env.storage().instance().get(&DataKey::Name).expect("not initialized")
    }

    pub fn symbol(env: Env) -> String {
        env.storage().instance().get(&DataKey::Symbol).expect("not initialized")
    }

    pub fn set_minter(env: Env, admin: Address, new_minter: Address) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).expect("not initialized");
        assert_eq!(admin, stored_admin, "not admin");
        env.storage().instance().set(&DataKey::Minter, &new_minter);
    }
}
