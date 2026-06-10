import sql from "./db";

export async function upsertUser(walletAddress: string) {
  const [user] = await sql`
    INSERT INTO users (wallet_address) VALUES (${walletAddress})
    ON CONFLICT (wallet_address) DO UPDATE SET wallet_address = EXCLUDED.wallet_address
    RETURNING *
  `;
  return user;
}

export async function getUser(walletAddress: string) {
  const [user] = await sql`SELECT * FROM users WHERE wallet_address = ${walletAddress}`;
  return user ?? null;
}

export async function createSubmission(data: {
  contractSubmissionId?: number;
  submitterWallet: string;
  wasteType: string;
  weightKg: number;
  location: string;
  photoUrl?: string;
  photoHash?: string;
  rewardAmount: number;
}) {
  const [row] = await sql`
    INSERT INTO waste_submissions
      (contract_submission_id, submitter_wallet, waste_type, weight_kg, location, photo_url, photo_hash, reward_amount)
    VALUES
      (${data.contractSubmissionId ?? null}, ${data.submitterWallet}, ${data.wasteType},
       ${data.weightKg}, ${data.location}, ${data.photoUrl ?? null}, ${data.photoHash ?? null}, ${data.rewardAmount})
    RETURNING *
  `;
  return row;
}

export async function updateSubmissionStatus(
  id: number,
  status: "verified" | "rejected",
  verifiedBy: string,
  txHash?: string
) {
  const [row] = await sql`
    UPDATE waste_submissions
    SET status = ${status}, verified_by = ${verifiedBy}, verified_at = NOW(), tx_hash = ${txHash ?? null}
    WHERE id = ${id}
    RETURNING *
  `;
  if (status === "verified") {
    await sql`
      UPDATE users SET
        total_waste_kg = total_waste_kg + (SELECT weight_kg FROM waste_submissions WHERE id = ${id}),
        total_rewards_earned = total_rewards_earned + (SELECT reward_amount FROM waste_submissions WHERE id = ${id})
      WHERE wallet_address = (SELECT submitter_wallet FROM waste_submissions WHERE id = ${id})
    `;
    await addReputationEvent(row.submitter_wallet, "waste_verified", 10, id);
  }
  return row;
}

export async function getSubmissions(walletAddress?: string, status?: string) {
  if (walletAddress && status) {
    return sql`SELECT * FROM waste_submissions WHERE submitter_wallet = ${walletAddress} AND status = ${status} ORDER BY created_at DESC`;
  } else if (walletAddress) {
    return sql`SELECT * FROM waste_submissions WHERE submitter_wallet = ${walletAddress} ORDER BY created_at DESC`;
  } else if (status) {
    return sql`SELECT * FROM waste_submissions WHERE status = ${status} ORDER BY created_at DESC`;
  }
  return sql`SELECT * FROM waste_submissions ORDER BY created_at DESC LIMIT 100`;
}

export async function getListings(activeOnly = true) {
  if (activeOnly) return sql`SELECT * FROM marketplace_listings WHERE active = true ORDER BY created_at DESC`;
  return sql`SELECT * FROM marketplace_listings ORDER BY created_at DESC`;
}

export async function createListing(data: {
  contractListingId?: number;
  sellerWallet: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  category?: string;
  imageUrl?: string;
}) {
  const [row] = await sql`
    INSERT INTO marketplace_listings
      (contract_listing_id, seller_wallet, title, description, price, quantity, category, image_url)
    VALUES
      (${data.contractListingId ?? null}, ${data.sellerWallet}, ${data.title}, ${data.description},
       ${data.price}, ${data.quantity}, ${data.category ?? null}, ${data.imageUrl ?? null})
    RETURNING *
  `;
  return row;
}

export async function recordRedemption(
  listingId: number,
  buyerWallet: string,
  quantity: number,
  totalCost: number,
  txHash?: string
) {
  const [row] = await sql`
    INSERT INTO redemptions (listing_id, buyer_wallet, quantity, total_cost, tx_hash)
    VALUES (${listingId}, ${buyerWallet}, ${quantity}, ${totalCost}, ${txHash ?? null})
    RETURNING *
  `;
  await addReputationEvent(buyerWallet, "redemption", 5, listingId);
  return row;
}

export async function addReputationEvent(
  walletAddress: string,
  eventType: string,
  points: number,
  referenceId?: number
) {
  await sql`
    INSERT INTO reputation_events (wallet_address, event_type, points, reference_id)
    VALUES (${walletAddress}, ${eventType}, ${points}, ${referenceId ?? null})
  `;
  await sql`
    UPDATE users SET reputation_score = reputation_score + ${points}
    WHERE wallet_address = ${walletAddress}
  `;
}

export async function getLeaderboard(limit = 10) {
  return sql`
    SELECT wallet_address, display_name, reputation_score, total_waste_kg, total_rewards_earned
    FROM users ORDER BY reputation_score DESC LIMIT ${limit}
  `;
}
