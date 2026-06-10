import Marketplace from "@/components/Marketplace";

export default function MarketplacePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Marketplace</h1>
        <p className="text-gray-500 text-sm">Redeem your MINT tokens for eco-rewards and real products.</p>
      </div>
      <Marketplace />
    </div>
  );
}
