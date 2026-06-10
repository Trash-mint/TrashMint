export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { recordRedemption } from "@/lib/queries";

export async function POST(req: NextRequest) {
  const { listingId, buyerWallet, quantity, totalCost, txHash } = await req.json();
  if (!listingId || !buyerWallet || !quantity || !totalCost) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const row = await recordRedemption(listingId, buyerWallet, quantity, totalCost, txHash);
  return NextResponse.json(row, { status: 201 });
}
