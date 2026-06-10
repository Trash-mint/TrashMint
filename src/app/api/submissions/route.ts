export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createSubmission, getSubmissions, upsertUser } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const rows = await getSubmissions(wallet, status);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { submitterWallet, wasteType, weightKg, location, photoUrl, photoHash, rewardAmount, contractSubmissionId } = body;
  if (!submitterWallet || !wasteType || !weightKg || !location) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  await upsertUser(submitterWallet);
  const reward = rewardAmount ?? Math.round(weightKg * 10 * 1e7);
  const row = await createSubmission({ submitterWallet, wasteType, weightKg, location, photoUrl, photoHash, rewardAmount: reward, contractSubmissionId });
  return NextResponse.json(row, { status: 201 });
}
