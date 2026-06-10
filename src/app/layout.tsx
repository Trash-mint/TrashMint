import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/hooks/useWallet";
import { Toaster } from "react-hot-toast";
import WalletButton from "@/components/WalletButton";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TrashMint — Turn waste into value",
  description: "Stellar-powered recycling rewards dApp",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <WalletProvider>
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-bold text-mint-700 text-lg">
                🗑️ TrashMint
              </Link>
              <nav className="hidden sm:flex gap-6 text-sm text-gray-600">
                <Link href="/submit" className="hover:text-mint-700 transition-colors">Submit</Link>
                <Link href="/verify" className="hover:text-mint-700 transition-colors">Verify</Link>
                <Link href="/marketplace" className="hover:text-mint-700 transition-colors">Marketplace</Link>
                <Link href="/reputation" className="hover:text-mint-700 transition-colors">Reputation</Link>
              </nav>
              <WalletButton />
            </div>
          </header>
          <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
          <Toaster position="bottom-right" />
        </WalletProvider>
      </body>
    </html>
  );
}
