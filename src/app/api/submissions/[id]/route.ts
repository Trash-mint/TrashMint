export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { updateSubmissionStatus } from "@/lib/queries";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { status, verifiedBy, txHash } = await req.json();
  if (!["verified", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const row = await updateSubmissionStatus(Number(params.id), status, verifiedBy, txHash);
  return NextResponse.json(row);
}
