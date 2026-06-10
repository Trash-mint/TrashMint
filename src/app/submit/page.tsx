import WasteSubmissionForm from "@/components/WasteSubmissionForm";
import SubmissionHistory from "@/components/SubmissionHistory";

export default function SubmitPage() {
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Submit Waste</h1>
        <p className="text-gray-500 text-sm">Log recycled materials. Earn 10 MINT per kg after verification.</p>
      </div>
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <WasteSubmissionForm />
      </div>
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">Your Submissions</h2>
        <SubmissionHistory />
      </div>
    </div>
  );
}
