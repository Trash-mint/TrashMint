export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getListings, createListing, upsertUser } from "@/lib/queries";

export async function GET() {
  const rows = await getListings(true);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sellerWallet, title, description, price, quantity, category, imageUrl } = body;
  if (!sellerWallet || !title || !price || !quantity) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  await upsertUser(sellerWallet);
  const row = await createListing({ sellerWallet, title, description, price, quantity, category, imageUrl });
  return NextResponse.json(row, { status: 201 });
}
