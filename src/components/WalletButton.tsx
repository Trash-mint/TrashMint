"use client";
import { useWallet } from "@/hooks/useWallet";

export default function WalletButton() {
  const { address, connecting, connect, disconnect } = useWallet();
  const short = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : null;

  return address ? (
    <button
      onClick={disconnect}
      className="flex items-center gap-2 px-4 py-2 bg-mint-700 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
    >
      <span className="w-2 h-2 rounded-full bg-mint-400" />
      {short}
    </button>
  ) : (
    <button
      onClick={connect}
      disabled={connecting}
      className="px-4 py-2 bg-mint-600 text-white rounded-lg text-sm font-medium hover:bg-mint-700 disabled:opacity-50 transition-colors"
    >
      {connecting ? "Connecting…" : "Connect Freighter"}
    </button>
  );
}
