"use client";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useWallet } from "@/hooks/useWallet";
import { buildContractCall, submitSignedTx, stringVal, u32Val, addressVal } from "@/lib/stellar";

const WASTE_CONTRACT = process.env.NEXT_PUBLIC_WASTE_CONTRACT_ID!;

const WASTE_TYPES = ["Plastic", "Glass", "Metal", "Paper", "E-Waste", "Organic", "Mixed"];

type FormData = {
  wasteType: string;
  weightKg: number;
  location: string;
  photoUrl: string;
};

export default function WasteSubmissionForm({ onSuccess }: { onSuccess?: () => void }) {
  const { address, signTx } = useWallet();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (!address) return toast.error("Connect wallet first");
    try {
      // Build and sign Soroban tx
      const tx = await buildContractCall(
        WASTE_CONTRACT,
        "submit",
        [
          addressVal(address),
          stringVal(data.wasteType),
          u32Val(Math.round(data.weightKg)),
          stringVal(data.location),
          stringVal(data.photoUrl || ""),
        ],
        address
      );
      const signed = await signTx(tx.toXDR());
      const { hash } = await submitSignedTx(signed);

      // Persist to DB
      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, submitterWallet: address, txHash: hash }),
      });

      toast.success("Waste submitted! Awaiting verification.");
      reset();
      onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || "Submission failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Waste Type</label>
        <select
          {...register("wasteType", { required: "Required" })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-mint-400 focus:outline-none"
        >
          <option value="">Select type…</option>
          {WASTE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {errors.wasteType && <p className="text-red-500 text-xs mt-1">{errors.wasteType.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
        <input
          type="number"
          step="0.1"
          min="0.1"
          {...register("weightKg", { required: "Required", min: 0.1, valueAsNumber: true })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-mint-400 focus:outline-none"
          placeholder="e.g. 2.5"
        />
        {errors.weightKg && <p className="text-red-500 text-xs mt-1">Enter a valid weight</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input
          {...register("location", { required: "Required" })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-mint-400 focus:outline-none"
          placeholder="e.g. 123 Main St, City"
        />
        {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL (proof)</label>
        <input
          {...register("photoUrl")}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-mint-400 focus:outline-none"
          placeholder="https://…"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !address}
        className="w-full bg-mint-600 text-white py-2.5 rounded-lg font-semibold hover:bg-mint-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? "Submitting…" : "Submit Waste"}
      </button>
    </form>
  );
}
