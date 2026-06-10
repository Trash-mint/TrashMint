"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  getPublicKey,
  isConnected,
  signTransaction,
  requestAccess,
} from "@stellar/freighter-api";

interface WalletCtx {
  address: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTx: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletCtx | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const connected = await isConnected();
      if (!connected) await requestAccess();
      const pubkey = await getPublicKey();
      setAddress(pubkey);
      // Register user in DB
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: pubkey }),
      });
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => setAddress(null), []);

  const signTx = useCallback(
    async (xdr: string) => {
      if (!address) throw new Error("Not connected");
      const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet" ? "PUBLIC" : "TESTNET";
      const result = await signTransaction(xdr, { network });
      return result;
    },
    [address]
  );

  return (
    <WalletContext.Provider value={{ address, connecting, connect, disconnect, signTx }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
