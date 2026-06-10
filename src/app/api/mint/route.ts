export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { mintReward } from "@/lib/mint";
import sql from "@/lib/db";

export async function POST(req: NextRequest) {
  const { submissionId, walletAddress } = await req.json();
  if (!submissionId || !walletAddress) {
    return NextResponse.json({ error: "submissionId and walletAddress required" }, { status: 400 });
  }
  const [sub] = await sql`SELECT reward_amount FROM waste_submissions WHERE id = ${submissionId}`;
  if (!sub) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  const txHash = await mintReward(walletAddress, BigInt(sub.reward_amount));
  await sql`UPDATE waste_submissions SET tx_hash = ${txHash} WHERE id = ${submissionId}`;
  return NextResponse.json({ txHash });
}
