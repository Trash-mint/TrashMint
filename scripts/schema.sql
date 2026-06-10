-- TrashMint database schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(64) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  reputation_score INTEGER DEFAULT 0,
  total_waste_kg NUMERIC(10,2) DEFAULT 0,
  total_rewards_earned BIGINT DEFAULT 0,
  is_recycler BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS waste_submissions (
  id SERIAL PRIMARY KEY,
  contract_submission_id BIGINT UNIQUE,
  submitter_wallet VARCHAR(64) NOT NULL REFERENCES users(wallet_address),
  waste_type VARCHAR(50) NOT NULL,
  weight_kg NUMERIC(8,2) NOT NULL,
  location VARCHAR(200),
  photo_url VARCHAR(500),
  photo_hash VARCHAR(128),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
  reward_amount BIGINT DEFAULT 0,
  verified_by VARCHAR(64),
  verified_at TIMESTAMPTZ,
  tx_hash VARCHAR(128),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketplace_listings (
  id SERIAL PRIMARY KEY,
  contract_listing_id BIGINT UNIQUE,
  seller_wallet VARCHAR(64) NOT NULL REFERENCES users(wallet_address),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  quantity INTEGER NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  category VARCHAR(50),
  image_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS redemptions (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES marketplace_listings(id),
  buyer_wallet VARCHAR(64) NOT NULL REFERENCES users(wallet_address),
  quantity INTEGER NOT NULL,
  total_cost BIGINT NOT NULL,
  tx_hash VARCHAR(128),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reputation_events (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(64) NOT NULL REFERENCES users(wallet_address),
  event_type VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL,
  reference_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_submitter ON waste_submissions(submitter_wallet);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON waste_submissions(status);
CREATE INDEX IF NOT EXISTS idx_listings_active ON marketplace_listings(active);
CREATE INDEX IF NOT EXISTS idx_reputation_wallet ON reputation_events(wallet_address);
