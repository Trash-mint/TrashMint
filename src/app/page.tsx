import Link from "next/link";

export default function Home() {
  const cards = [
    { href: "/submit", icon: "♻️", title: "Submit Waste", desc: "Log recycled materials and earn MINT tokens" },
    { href: "/verify", icon: "✅", title: "Verify", desc: "Recyclers approve submissions and trigger minting" },
    { href: "/marketplace", icon: "🛍️", title: "Marketplace", desc: "Spend MINT tokens on eco-rewards" },
    { href: "/reputation", icon: "🏅", title: "Reputation", desc: "Track your impact and climb the leaderboard" },
  ];

  return (
    <div className="text-center py-12">
      <h1 className="text-5xl font-extrabold text-mint-700 mb-3">TrashMint</h1>
      <p className="text-xl text-gray-500 mb-12">Turn urban waste into digital value on Stellar.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
        {cards.map(({ href, icon, title, desc }) => (
          <Link key={href} href={href}
            className="flex flex-col items-center bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-mint-400 transition-all group">
            <span className="text-4xl mb-3">{icon}</span>
            <h2 className="font-bold text-gray-800 group-hover:text-mint-700">{title}</h2>
            <p className="text-sm text-gray-400 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
