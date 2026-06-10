"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useWallet } from "@/hooks/useWallet";
import { buildContractCall, submitSignedTx, u64Val, addressVal } from "@/lib/stellar";
import { nativeToScVal } from "@stellar/stellar-sdk";

const WASTE_CONTRACT = process.env.NEXT_PUBLIC_WASTE_CONTRACT_ID!;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ID!;

type Submission = {
  id: number;
  contract_submission_id: number;
  submitter_wallet: string;
  waste_type: string;
  weight_kg: string;
  location: string;
  photo_url?: string;
  status: string;
  reward_amount: string;
  created_at: string;
};

export default function RecyclerVerification() {
  const { address, signTx } = useWallet();
  const [pending, setPending] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);

  const loadPending = () => {
    setLoading(true);
    fetch("/api/submissions?status=pending")
      .then((r) => r.json())
      .then(setPending)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPending(); }, []);

  const verify = async (sub: Submission, approved: boolean) => {
    if (!address) return toast.error("Connect wallet");
    setProcessing(sub.id);
    try {
      if (sub.contract_submission_id) {
        const tx = await buildContractCall(
          WASTE_CONTRACT,
          "verify",
          [addressVal(address), u64Val(BigInt(sub.contract_submission_id)), nativeToScVal(approved, { type: "bool" })],
          address
        );
        const signed = await signTx(tx.toXDR());
        await submitSignedTx(signed);
      }

      // If approved, trigger minting
      if (approved) {
        await fetch("/api/mint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submissionId: sub.id, walletAddress: sub.submitter_wallet }),
        });
      }

      await fetch(`/api/submissions/${sub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: approved ? "verified" : "rejected", verifiedBy: address }),
      });

      toast.success(approved ? "Verified & tokens minted!" : "Submission rejected");
      setPending((prev) => prev.filter((s) => s.id !== sub.id));
    } catch (e: any) {
      toast.error(e.message || "Error processing");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">Pending Verifications ({pending.length})</h2>
        <button onClick={loadPending} className="text-xs text-mint-600 hover:underline">Refresh</button>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}

      {!loading && pending.length === 0 && (
        <p className="text-gray-400 text-sm">No pending submissions.</p>
      )}

      {pending.map((sub) => (
        <div key={sub.id} className="bg-white border rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">{sub.waste_type} — {sub.weight_kg} kg</p>
              <p className="text-xs text-gray-500">{sub.location}</p>
              <p className="text-xs text-gray-400">
                {sub.submitter_wallet.slice(0, 8)}… · {new Date(sub.created_at).toLocaleString()}
              </p>
            </div>
            <p className="text-sm font-medium text-mint-600">
              +{(Number(sub.reward_amount) / 1e7).toFixed(1)} MINT
            </p>
          </div>
          {sub.photo_url && (
            <a href={sub.photo_url} target="_blank" rel="noopener noreferrer"
               className="text-xs text-blue-500 hover:underline">View photo →</a>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => verify(sub, true)}
              disabled={processing === sub.id}
              className="flex-1 py-1.5 bg-mint-600 text-white rounded-lg text-sm font-medium hover:bg-mint-700 disabled:opacity-50"
            >
              {processing === sub.id ? "Processing…" : "✓ Approve"}
            </button>
            <button
              onClick={() => verify(sub, false)}
              disabled={processing === sub.id}
              className="flex-1 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
            >
              ✗ Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
