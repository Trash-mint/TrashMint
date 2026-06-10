export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { upsertUser } from "@/lib/queries";

export async function POST(req: NextRequest) {
  const { walletAddress } = await req.json();
  if (!walletAddress) return NextResponse.json({ error: "walletAddress required" }, { status: 400 });
  const user = await upsertUser(walletAddress);
  return NextResponse.json(user);
}
