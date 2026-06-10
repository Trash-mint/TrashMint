"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";

type UserStats = {
  wallet_address: string;
  display_name?: string;
  reputation_score: number;
  total_waste_kg: string;
  total_rewards_earned: string;
};

function ReputationBadge({ score }: { score: number }) {
  const tiers = [
    { min: 500, label: "🏆 Champion", color: "text-yellow-600 bg-yellow-50 border-yellow-300" },
    { min: 200, label: "⭐ Expert", color: "text-purple-600 bg-purple-50 border-purple-300" },
    { min: 50, label: "🌿 Green", color: "text-mint-700 bg-mint-50 border-mint-400" },
    { min: 0, label: "🌱 Seedling", color: "text-gray-600 bg-gray-50 border-gray-300" },
  ];
  const tier = tiers.find((t) => score >= t.min)!;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tier.color}`}>
      {tier.label}
    </span>
  );
}

export default function UserReputation() {
  const { address } = useWallet();
  const [user, setUser] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard").then((r) => r.json()).then(setLeaderboard);
    if (address) {
      fetch(`/api/users/${address}`).then((r) => r.json()).then(setUser);
    }
  }, [address]);

  return (
    <div className="space-y-6">
      {user && (
        <div className="bg-gradient-to-r from-mint-600 to-mint-700 text-white rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-75">Your Reputation</p>
              <p className="text-4xl font-bold">{user.reputation_score}</p>
              <div className="mt-2"><ReputationBadge score={user.reputation_score} /></div>
            </div>
            <div className="text-right text-sm space-y-1">
              <p><span className="opacity-75">Waste recycled:</span> <strong>{Number(user.total_waste_kg).toFixed(1)} kg</strong></p>
              <p><span className="opacity-75">MINT earned:</span> <strong>{(Number(user.total_rewards_earned) / 1e7).toFixed(1)}</strong></p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-gray-700 mb-3">🏅 Leaderboard</h3>
        <div className="space-y-2">
          {leaderboard.map((u, i) => (
            <div
              key={u.wallet_address}
              className={`flex items-center gap-3 p-3 rounded-xl border ${u.wallet_address === address ? "border-mint-400 bg-mint-50" : "bg-white"}`}
            >
              <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {u.display_name || `${u.wallet_address.slice(0, 8)}…`}
                </p>
                <p className="text-xs text-gray-400">{Number(u.total_waste_kg).toFixed(1)} kg recycled</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-mint-600">{u.reputation_score} pts</p>
                <ReputationBadge score={u.reputation_score} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
