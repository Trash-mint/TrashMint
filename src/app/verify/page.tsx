import RecyclerVerification from "@/components/RecyclerVerification";

export default function VerifyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Recycler Verification</h1>
        <p className="text-gray-500 text-sm">Review pending waste submissions and approve or reject them.</p>
      </div>
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <RecyclerVerification />
      </div>
    </div>
  );
}
