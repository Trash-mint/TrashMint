import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await getLeaderboard(10);
  return NextResponse.json(rows);
}
