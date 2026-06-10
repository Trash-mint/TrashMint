export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/queries";

export async function GET(_req: NextRequest, { params }: { params: { address: string } }) {
  const user = await getUser(params.address);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}
