import UserReputation from "@/components/UserReputation";

export default function ReputationPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Reputation</h1>
        <p className="text-gray-500 text-sm">Your recycling impact score and community leaderboard.</p>
      </div>
      <UserReputation />
    </div>
  );
}
