"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useWallet } from "@/hooks/useWallet";
import { buildContractCall, submitSignedTx, u64Val, u32Val, addressVal } from "@/lib/stellar";

const MARKETPLACE_CONTRACT = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID!;

type Listing = {
  id: number;
  contract_listing_id: number;
  seller_wallet: string;
  title: string;
  description: string;
  price: string;
  quantity: number;
  active: boolean;
  category?: string;
  image_url?: string;
};

export default function Marketplace() {
  const { address, signTx } = useWallet();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price: "", quantity: "1", category: "" });

  useEffect(() => {
    fetch("/api/listings")
      .then((r) => r.json())
      .then(setListings)
      .finally(() => setLoading(false));
  }, []);

  const redeem = async (listing: Listing) => {
    if (!address) return toast.error("Connect wallet");
    setRedeeming(listing.id);
    try {
      const tx = await buildContractCall(
        MARKETPLACE_CONTRACT,
        "redeem",
        [addressVal(address), u64Val(BigInt(listing.contract_listing_id)), u32Val(1)],
        address
      );
      const signed = await signTx(tx.toXDR());
      const { hash } = await submitSignedTx(signed);

      await fetch("/api/redemptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id, buyerWallet: address, quantity: 1, totalCost: Number(listing.price), txHash: hash }),
      });
      toast.success("Redeemed successfully!");
      setListings((prev) => prev.map((l) => l.id === listing.id ? { ...l, quantity: l.quantity - 1, active: l.quantity > 1 } : l));
    } catch (e: any) {
      toast.error(e.message || "Redemption failed");
    } finally {
      setRedeeming(null);
    }
  };

  const createListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return toast.error("Connect wallet");
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sellerWallet: address, price: Math.round(Number(form.price) * 1e7), quantity: Number(form.quantity) }),
      });
      const listing = await res.json();
      setListings((prev) => [listing, ...prev]);
      setShowCreate(false);
      setForm({ title: "", description: "", price: "", quantity: "1", category: "" });
      toast.success("Listing created!");
    } catch (e: any) {
      toast.error(e.message || "Failed to create listing");
    }
  };

  if (loading) return <p className="text-gray-400 text-sm">Loading marketplace…</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-700">Marketplace ({listings.filter(l => l.active).length} items)</h2>
        {address && (
          <button onClick={() => setShowCreate(!showCreate)}
            className="text-sm px-3 py-1.5 bg-mint-600 text-white rounded-lg hover:bg-mint-700">
            + List Item
          </button>
        )}
      </div>

      {showCreate && (
        <form onSubmit={createListing} className="bg-gray-50 border rounded-xl p-4 space-y-3">
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
            placeholder="Title" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-mint-400 focus:outline-none" />
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-mint-400 focus:outline-none" />
          <div className="flex gap-2">
            <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required
              type="number" min="0.1" step="0.1" placeholder="Price (MINT)" className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-mint-400 focus:outline-none" />
            <input value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required
              type="number" min="1" placeholder="Qty" className="w-24 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-mint-400 focus:outline-none" />
          </div>
          <button type="submit" className="w-full py-2 bg-mint-600 text-white rounded-lg text-sm font-medium hover:bg-mint-700">Create Listing</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {listings.filter(l => l.active).map((l) => (
          <div key={l.id} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-2">
            {l.image_url && <img src={l.image_url} alt={l.title} className="w-full h-32 object-cover rounded-lg" />}
            <div>
              <p className="font-semibold">{l.title}</p>
              {l.category && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{l.category}</span>}
              <p className="text-xs text-gray-500 mt-1">{l.description}</p>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div>
                <p className="font-bold text-mint-600">{(Number(l.price) / 1e7).toFixed(1)} MINT</p>
                <p className="text-xs text-gray-400">{l.quantity} left</p>
              </div>
              <button
                onClick={() => redeem(l)}
                disabled={redeeming === l.id || !address}
                className="px-3 py-1.5 bg-trash-600 text-white rounded-lg text-sm font-medium hover:bg-trash-400 disabled:opacity-50 transition-colors"
              >
                {redeeming === l.id ? "Redeeming…" : "Redeem"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
