#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Listing(u64),
    ListingCount,
    Admin,
    TokenContract,
}

#[contracttype]
#[derive(Clone)]
pub struct Listing {
    pub id: u64,
    pub seller: Address,
    pub title: String,
    pub description: String,
    pub price: i128,
    pub quantity: u32,
    pub active: bool,
}

#[contract]
pub struct Marketplace;

#[contractimpl]
impl Marketplace {
    pub fn initialize(env: Env, admin: Address, token_contract: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenContract, &token_contract);
        env.storage().instance().set(&DataKey::ListingCount, &0u64);
    }

    pub fn list_item(
        env: Env,
        seller: Address,
        title: String,
        description: String,
        price: i128,
        quantity: u32,
    ) -> u64 {
        seller.require_auth();
        assert!(price > 0 && quantity > 0, "invalid params");
        let count: u64 = env.storage().instance().get(&DataKey::ListingCount).unwrap_or(0);
        let id = count + 1;
        let listing = Listing { id, seller, title, description, price, quantity, active: true };
        env.storage().persistent().set(&DataKey::Listing(id), &listing);
        env.storage().instance().set(&DataKey::ListingCount, &id);
        env.events().publish((Symbol::new(&env, "listed"),), id);
        id
    }

    pub fn redeem(env: Env, buyer: Address, listing_id: u64, quantity: u32) {
        buyer.require_auth();
        let mut listing: Listing = env
            .storage()
            .persistent()
            .get(&DataKey::Listing(listing_id))
            .expect("listing not found");
        assert!(listing.active, "listing inactive");
        assert!(listing.quantity >= quantity, "insufficient stock");
        let total_cost = listing.price * quantity as i128;
        // Transfer tokens from buyer to seller (caller must have approved)
        let token: Address = env.storage().instance().get(&DataKey::TokenContract).expect("not initialized");
        env.invoke_contract::<()>(
            &token,
            &Symbol::new(&env, "transfer"),
            soroban_sdk::vec![
                &env,
                buyer.to_val(),
                listing.seller.to_val(),
                total_cost.into(),
            ],
        );
        listing.quantity -= quantity;
        if listing.quantity == 0 {
            listing.active = false;
        }
        env.storage().persistent().set(&DataKey::Listing(listing_id), &listing);
        env.events().publish((Symbol::new(&env, "redeemed"),), (listing_id, buyer, quantity));
    }

    pub fn get_listing(env: Env, id: u64) -> Listing {
        env.storage().persistent().get(&DataKey::Listing(id)).expect("not found")
    }

    pub fn deactivate(env: Env, seller: Address, listing_id: u64) {
        seller.require_auth();
        let mut listing: Listing = env.storage().persistent().get(&DataKey::Listing(listing_id)).expect("not found");
        assert_eq!(listing.seller, seller, "not owner");
        listing.active = false;
        env.storage().persistent().set(&DataKey::Listing(listing_id), &listing);
    }

    pub fn listing_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::ListingCount).unwrap_or(0)
    }
}
