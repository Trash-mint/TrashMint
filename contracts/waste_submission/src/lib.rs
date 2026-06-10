#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Submission(u64),
    SubmissionCount,
    Recycler(Address),
    Admin,
}

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum SubmissionStatus {
    Pending,
    Verified,
    Rejected,
}

#[contracttype]
#[derive(Clone)]
pub struct WasteSubmission {
    pub id: u64,
    pub submitter: Address,
    pub waste_type: String,
    pub weight_kg: u32,
    pub location: String,
    pub photo_hash: String,
    pub status: SubmissionStatus,
    pub reward_amount: i128,
    pub timestamp: u64,
}

#[contract]
pub struct WasteSubmissionContract;

#[contractimpl]
impl WasteSubmissionContract {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::SubmissionCount, &0u64);
    }

    pub fn submit(
        env: Env,
        submitter: Address,
        waste_type: String,
        weight_kg: u32,
        location: String,
        photo_hash: String,
    ) -> u64 {
        submitter.require_auth();
        let count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::SubmissionCount)
            .unwrap_or(0);
        let id = count + 1;
        let submission = WasteSubmission {
            id,
            submitter,
            waste_type,
            weight_kg,
            location,
            photo_hash,
            status: SubmissionStatus::Pending,
            reward_amount: (weight_kg as i128) * 10_000_000, // 10 MINT per kg
            timestamp: env.ledger().timestamp(),
        };
        env.storage()
            .persistent()
            .set(&DataKey::Submission(id), &submission);
        env.storage()
            .instance()
            .set(&DataKey::SubmissionCount, &id);
        env.events().publish(
            (Symbol::new(&env, "submitted"),),
            (id, submission.submitter.clone()),
        );
        id
    }

    pub fn verify(env: Env, recycler: Address, submission_id: u64, approved: bool) {
        recycler.require_auth();
        let key = DataKey::Recycler(recycler.clone());
        if !env.storage().persistent().has(&key) {
            panic!("not a registered recycler");
        }
        let mut sub: WasteSubmission = env
            .storage()
            .persistent()
            .get(&DataKey::Submission(submission_id))
            .expect("submission not found");
        if sub.status != SubmissionStatus::Pending {
            panic!("already processed");
        }
        sub.status = if approved {
            SubmissionStatus::Verified
        } else {
            SubmissionStatus::Rejected
        };
        env.storage()
            .persistent()
            .set(&DataKey::Submission(submission_id), &sub);
        env.events().publish(
            (Symbol::new(&env, "verified"),),
            (submission_id, approved),
        );
    }

    pub fn register_recycler(env: Env, admin: Address, recycler: Address) {
        admin.require_auth();
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialized");
        if admin != stored_admin {
            panic!("not admin");
        }
        env.storage()
            .persistent()
            .set(&DataKey::Recycler(recycler), &true);
    }

    pub fn get_submission(env: Env, id: u64) -> WasteSubmission {
        env.storage()
            .persistent()
            .get(&DataKey::Submission(id))
            .expect("not found")
    }

    pub fn submission_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::SubmissionCount)
            .unwrap_or(0)
    }
}
