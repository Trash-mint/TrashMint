"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import clsx from "clsx";

type Submission = {
  id: number;
  waste_type: string;
  weight_kg: string;
  location: string;
  status: "pending" | "verified" | "rejected";
  reward_amount: string;
  created_at: string;
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  verified: "bg-mint-50 text-mint-700 border border-mint-400",
  rejected: "bg-red-50 text-red-600",
};

export default function SubmissionHistory() {
  const { address } = useWallet();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`/api/submissions?wallet=${address}`)
      .then((r) => r.json())
      .then(setSubmissions)
      .finally(() => setLoading(false));
  }, [address]);

  if (!address) return null;
  if (loading) return <p className="text-gray-500 text-sm">Loading…</p>;
  if (!submissions.length) return <p className="text-gray-400 text-sm">No submissions yet.</p>;

  return (
    <div className="space-y-2">
      {submissions.map((s) => (
        <div key={s.id} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
          <div>
            <p className="font-medium text-sm">{s.waste_type} — {s.weight_kg} kg</p>
            <p className="text-xs text-gray-400">{s.location} · {new Date(s.created_at).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[s.status])}>
              {s.status}
            </span>
            {s.status === "verified" && (
              <p className="text-xs text-mint-600 mt-0.5">+{(Number(s.reward_amount) / 1e7).toFixed(1)} MINT</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
