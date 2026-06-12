<div align="center">

<!-- Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00C6FF,100:0072FF&height=200&section=header&text=TrashMint&fontSize=72&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Turn%20Urban%20Waste%20Into%20Digital%20Value&descAlignY=62&descAlign=50" width="100%"/>

<br/>

[![Stellar](https://img.shields.io/badge/Powered%20By-Stellar-7C3AED?style=for-the-badge&logo=stellar&logoColor=white)](https://stellar.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active%20Development-F59E0B?style=for-the-badge)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-3B82F6?style=for-the-badge)](CONTRIBUTING.md)
[![Built With Web3](https://img.shields.io/badge/Built%20With-Web3-EC4899?style=for-the-badge)]()

<br/>

> **♻️ TrashMint** bridges the physical and digital economies — rewarding citizens for verified recycling activity with blockchain-native tokens on the **Stellar network**. Every bottle returned, every bag sorted, every drop-off verified becomes a minted moment of value.

<br/>

[🚀 Live Demo](#) · [📖 Docs](#documentation) · [🐛 Report Bug](../../issues) · [✨ Request Feature](../../issues)

</div>

---
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/9c60919a-138d-410f-aa93-363c68811c78" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/dcb7f787-778d-45e7-8627-caf956b09b0c" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/77da5bef-d411-49c6-b6a0-143e262e6f10" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/29728167-4c07-48f5-9d2c-3085243a540c" />

link to website https://mint-loop-spark.lovable.app/

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution-trashmint)
- [Architecture Overview](#-architecture-overview)
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [Token Economy (MINT)](#-token-economy-mint)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Smart Contract / Stellar Integration](#-smart-contract--stellar-integration)
- [API Reference](#-api-reference)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌍 The Problem

Urban waste is a $2 trillion global challenge. In cities across Africa, Asia, and Latin America:

- **~90%** of waste is dumped in open landfills or burned
- Informal waste pickers — millions of them — operate without income protection or recognition
- Municipalities lack incentive mechanisms to drive **citizen-level behavioral change**
- Existing recycling rewards are siloed, non-transferable, and easily gamed

> The gap isn't infrastructure — it's **incentive alignment**. People need a reason to care, and a reward they can actually use.

---

## ✅ The Solution: TrashMint

**TrashMint** is a decentralized recycling reward platform that:

1. **Verifies** physical waste drop-offs via QR-coded collection points or agent check-ins
2. **Mints** `$MINT` tokens on the Stellar blockchain proportional to waste type and weight
3. **Rewards** users instantly to their Stellar wallet — no bank account required
4. **Connects** token holders to a marketplace of redemption partners (airtime, groceries, transport)

Built for **last-mile accessibility**: works on low-end smartphones, supports USSD fallback, and settles in seconds using Stellar's low-fee network.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        TrashMint System                         │
├─────────────────┬───────────────────────┬───────────────────────┤
│   Mobile / Web  │    Backend Services   │   Stellar Network     │
│   (User Layer)  │    (API + Logic)      │   (Blockchain Layer)  │
│                 │                       │                       │
│  React / PWA ──►│  Express.js REST API ►│  Horizon API          │
│  USSD Gateway   │  Waste Verification   │  Soroban Smart        │
│  QR Scanner     │  Agent Dashboard      │  Contracts            │
│  Wallet UI      │  Fraud Detection      │  $MINT Token Issuer   │
│                 │  Event Queue          │  Trustline Manager    │
│                 │  (Redis / BullMQ)     │  DEX Integration      │
└─────────────────┴───────────────────────┴───────────────────────┘
                            │
              ┌─────────────▼─────────────┐
              │     Database Layer        │
              │  PostgreSQL + Redis Cache │
              │  IPFS (proof-of-drop)     │
              └───────────────────────────┘
```

**Flow Summary:**

```
User drops waste ──► Agent/IoT verifies ──► API triggers mint event
    ──► Soroban contract executes ──► $MINT credited to user wallet
    ──► User redeems at partner marketplace
```

---

## ✨ Core Features

### 🔐 Identity & Wallet
- Non-custodial Stellar wallet creation (no seed phrase memorization required — secured via social recovery)
- Federated Stellar address support (`username*trashmint.io`)
- Works with Freighter, Lobstr, and custom embedded wallet

### ♻️ Waste Verification
- QR-code drop-off points at certified collection centers
- Mobile agent check-in with photo proof (stored on IPFS)
- Supported waste categories: **Plastic · Glass · Metal · E-Waste · Paper**
- Weight-based and count-based reward calculation

### 🪙 Token Minting ($MINT)
- Stellar-native custom asset issued by the TrashMint foundation account
- Real-time issuance via Stellar Horizon API + Soroban smart contract hooks
- Transparent on-chain transaction history — every reward is auditable

### 📊 Dashboard & Analytics
- User wallet overview: balance, history, recycling impact stats
- Agent dashboard: daily volumes, verification queue, payout tracking
- Admin panel: token supply, agent management, fraud flags

### 🛒 Redemption Marketplace
- Partner-integrated redemption for airtime, transport credits, groceries
- Peer-to-peer token transfers
- XLM/MINT swap via Stellar DEX (Soroswap integration planned)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, TailwindCSS, PWA |
| **Backend** | Node.js, Express.js |
| **Blockchain** | Stellar Network (Horizon API, Soroban) |
| **Database** | PostgreSQL, Redis |
| **Storage** | IPFS (via Web3.Storage / Pinata) |
| **Queue** | BullMQ |
| **Auth** | JWT + Stellar keypair signing |
| **Wallet SDK** | `@stellar/stellar-sdk` |
| **Testing** | Jest, Supertest |
| **DevOps** | Docker, GitHub Actions, Railway / Render |

---

## 💰 Token Economy (MINT)

```
Token Symbol   : MINT
Network        : Stellar (Mainnet / Testnet)
Decimals       : 7 (Stellar standard)
Max Supply     : 1,000,000,000 MINT
Distribution   :
  ├── 60%  Recycling Rewards (citizen emissions)
  ├── 15%  Ecosystem & Partner Incentives
  ├── 10%  Team & Advisors (2yr vesting)
  ├── 10%  Foundation Reserve
  └──  5%  Community Grants & Hackathons
```

**Reward Rate Examples:**

| Waste Type | Unit | MINT Reward |
|---|---|---|
| PET Plastic | per kg | 50 MINT |
| Aluminium Cans | per kg | 80 MINT |
| Glass | per kg | 30 MINT |
| E-Waste | per item | 200 MINT |
| Cardboard/Paper | per kg | 20 MINT |

> Reward rates are governance-adjustable via a multi-sig foundation account.

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18.x`
- PostgreSQL `>= 14`
- Redis `>= 6`
- A Stellar testnet account (get one at [Stellar Laboratory](https://laboratory.stellar.org))
- Freighter wallet (optional, for frontend testing)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/teslims2/TrashMint.git
cd TrashMint

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Configure your .env (see below)

# 5. Run database migrations
npm run db:migrate

# 6. Seed test data (optional)
npm run db:seed

# 7. Start development server
npm run dev
```

The API will be available at `http://localhost:3000` and the frontend at `http://localhost:5173`.

---

## 🔧 Environment Variables

Create a `.env` file in the project root:

```env
# ─── App ────────────────────────────────────────────
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# ─── Database ───────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/trashmint
REDIS_URL=redis://localhost:6379

# ─── Stellar ────────────────────────────────────────
STELLAR_NETWORK=testnet                        # testnet | mainnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_ISSUER_PUBLIC_KEY=G...                 # MINT token issuer account
STELLAR_ISSUER_SECRET_KEY=S...                 # Keep this secret!
STELLAR_DISTRIBUTION_PUBLIC_KEY=G...
STELLAR_DISTRIBUTION_SECRET_KEY=S...
MINT_ASSET_CODE=MINT

# ─── IPFS ───────────────────────────────────────────
IPFS_API_KEY=your_web3storage_or_pinata_key

# ─── Auth ───────────────────────────────────────────
JWT_SECRET=your_very_long_random_secret
JWT_EXPIRES_IN=7d

# ─── Frontend ───────────────────────────────────────
VITE_API_BASE_URL=http://localhost:3000/api
VITE_STELLAR_NETWORK=testnet
```

> ⚠️ **Never commit your secret keys.** Use secret management tools (Railway secrets, GitHub Actions secrets, Doppler) in production.

---

## 🔗 Smart Contract / Stellar Integration

TrashMint uses the **Stellar Horizon API** for payment operations and is progressively integrating **Soroban** smart contracts for programmable reward logic.

### Issuing $MINT Tokens

```javascript
import { Asset, Keypair, TransactionBuilder, Operation, Networks } from '@stellar/stellar-sdk';
import server from './stellar/server.js';

const MINT = new Asset('MINT', process.env.STELLAR_ISSUER_PUBLIC_KEY);

export async function rewardUser(recipientPublicKey, amount) {
  const distributionKeypair = Keypair.fromSecret(process.env.STELLAR_DISTRIBUTION_SECRET_KEY);
  const distributionAccount = await server.loadAccount(distributionKeypair.publicKey());

  const transaction = new TransactionBuilder(distributionAccount, {
    fee: await server.fetchBaseFee(),
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: recipientPublicKey,
        asset: MINT,
        amount: amount.toString(),
      })
    )
    .addMemo(Memo.text('TrashMint Recycling Reward'))
    .setTimeout(30)
    .build();

  transaction.sign(distributionKeypair);
  return server.submitTransaction(transaction);
}
```

### Establishing a Trustline (Client-side)

```javascript
// Users must establish a trustline before receiving MINT
export async function createTrustline(userKeypair) {
  const account = await server.loadAccount(userKeypair.publicKey());

  const transaction = new TransactionBuilder(account, {
    fee: await server.fetchBaseFee(),
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.changeTrust({
        asset: MINT,
        limit: '1000000000', // max trust limit
      })
    )
    .setTimeout(30)
    .build();

  transaction.sign(userKeypair);
  return server.submitTransaction(transaction);
}
```

---

## 📡 API Reference

### Authentication

```
POST /api/auth/register        Create new user account
POST /api/auth/login           Login with email + password
POST /api/auth/wallet/connect  Link Stellar wallet address
```

### Recycling

```
POST /api/recycle/drop-off     Submit waste drop-off (agent verified)
GET  /api/recycle/history      User's drop-off history
GET  /api/recycle/categories   List supported waste types and rates
```

### Wallet

```
GET  /api/wallet/balance        Get $MINT balance
GET  /api/wallet/transactions   Transaction history
POST /api/wallet/transfer       Transfer MINT to another user
POST /api/wallet/trustline      Auto-establish Stellar trustline
```

### Admin / Agent

```
GET  /api/agent/queue           Pending verifications
POST /api/agent/verify/:id      Approve a drop-off
POST /api/agent/reject/:id      Reject with reason
GET  /api/admin/stats           Platform-wide analytics
```

> Full API documentation available at `/api/docs` (Swagger UI) when running in development mode.

---

## 🗺️ Roadmap

```
Phase 1 — Foundation (Current)
  ✅ Core API (auth, wallet, recycling)
  ✅ Stellar testnet integration
  ✅ Agent verification dashboard
  🔄 Mobile PWA (in progress)
  🔄 IPFS proof storage

Phase 2 — Ecosystem
  ⬜ Soroban smart contract migration
  ⬜ Mainnet launch (Abuja pilot)
  ⬜ Redemption marketplace (airtime, transport)
  ⬜ USSD fallback for feature phones

Phase 3 — Scale
  ⬜ Multi-city expansion (Lagos, Kano, Accra)
  ⬜ IoT bin integration (weight sensors)
  ⬜ Stellar DEX listing (MINT/XLM pair)
  ⬜ Carbon credit co-issuance
  ⬜ DAO governance for reward rates
```

---

## 🤝 Contributing

Contributions are what make this project grow. Here's how to get involved:

```bash
# Fork the repository, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for code style, commit conventions (Conventional Commits), and the PR process.

**Good first issues** are tagged [`good first issue`](../../labels/good%20first%20issue) — come say hi in Discussions first!

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

**Built with ♻️ and ⭐ by [Teslim Shittu](https://github.com/teslims2)**

*Turning trash into treasure, one transaction at a time.*

<br/>

[![Stellar](https://img.shields.io/badge/Stellar-Network-7C3AED?style=flat-square&logo=stellar)](https://stellar.org)
[![Nigeria](https://img.shields.io/badge/Made%20In-Nigeria%20🇳🇬-008751?style=flat-square)]()

</div>
