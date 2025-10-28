<div align="center">

# 🌊 Siphon Protocol

> **Enabling untraceable, hyperliquid and institutional-grade DeFi privacy**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-1.18-purple?style=for-the-badge&logo=solana)](https://solana.com/)
[![Arcium](https://img.shields.io/badge/Arcium-MPC-orange?style=for-the-badge)](https://arcium.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[🚀 Live Demo](https://siphon-sol.vercel.app) | [🐦 Twitter](https://x.com/SiphonMoney)

</div>

---
 
## 🎯 The Privacy Crisis We're Solving

### ⚠️ The DeFi Transparency Trap

#### 🔍 **Wallets Are Tracked**
- **Every transaction** exposes your entire financial history
- **Portfolio strategies** are visible to competitors and regulators
- **Institutional traders** cannot operate with confidentiality

#### 🤖 **Value Extraction**
- **Order intent** leaks milliseconds before execution
- **Visible flow**  widens quotes and worsens fills.
- **Sniping and MEV**  extraction destroys profitability.

#### 💰 **The Privacy-Liquidity Dilemma**
- **Privacy coins** (ZEC, XMR) lack DeFi integration
- **Dark pools** are fragmented and underutilized
- **Users forced** to choose: privacy OR best execution

### 📊 Market Reality
- **$300M+** lost monthly to front-running attacks on DEXs 
- **$12B** in privacy coin market cap lacks DeFi integration
- **Zero** truly private DEXs with easy access to global liquidity

> **The future of finance demands true privacy. We're building it.**

---

## 🚀 The Siphon Protocol

### 🌉 **The Solana Privacy Box**

**Siphon Protocol delivers institutional-grade dark pool matching with privacy coin on/off ramp integration, creating the ultimate confidential trading ecosystem.**

**Built on Arcium's MPC network for privacy settlement, Solana for liquidity settlement, and atomic bridges for private capital onboarding.**

### ✨ Key Features

#### 🔒 **Private Identity** 
- **Portfolio, PnL, and strategies** - are no longer visible on-chain

#### ⚡ **Private execution**
- **Private transaction routing** - eliminates order sniffing
- **Confidential settlement** - encrypted vault management
- **Fully encrypted orderbook** - amounts and prices never visible
- **Distributed privacy** - MPC network guarantees

#### 🪙 **Deep private and public liquidity**
- **Internal liquidity with private order books**
- **External liquidity with public solana liquidity**
- **Multi-chain bridges** 
- **ZEC-SOL Atomic Swaps** 
- **XMR-SOL Atomic Swaps** 

#### 💰 **Better Pricing**
- **Cheaper filling orders** - through private execution
- **Reduced slippage** - privacy-preserving routing

---






## 🛠️ Technical Architecture

### 🔧 Core Innovation Stack

#### 🌊 **Dark Pool Engine**
**Arcium MPC Network**
- **Encrypted orderbook** (1302-byte ciphertext)
- **Confidential matching** algorithms
- **Price-time priority** execution
- **Nonce-based security** system

#### 🪙 **Privacy Coin Bridges**
- **Multi-Chain Integration**
- **Privacy coins ZEC, XMR, else... Atomic Swaps**

#### ⚡ **Solana Settlement**
**High-Performance Layer**
- **65,000+ TPS** capability
- **Sub-cent transaction** costs
- **SPL token ecosystem** integration
- **Near-instant finality**

### 🚀 Confidential Trading Workflow

#### 1. **Encrypted Order Submission**
```rust
// Orders encrypted with x25519 + RescueCipher
let encrypted_order = Enc<Shared, OrderData> {
    amount: encrypted_amount,
    price: encrypted_price,
    user_pubkey: pubkey_chunks,
    nonce: orderbook_nonce
};
```

#### 2. **Confidential Matching Process**
- **MPC network** decrypts orderbook confidentially
- **Price-time priority** matching executed off-chain
- **Results encrypted** for blind access

#### 3. **Private Settlement Execution**
- **Backend decrypts** match results using match nonce
- **SPL token transfers** executed on Solana
- **Encrypted vault balances** updated
- **Settlement history** privately proofed

### 🔒 Unbreakable Privacy

- **Order amounts/prices**: Never stored in plaintext
- **Orderbook structure**: Hidden in encrypted ciphertext  
- **Match execution**: Only revealed to matched parties
- **Vault balances**: Encrypted state management
- **Transaction history**: Zero-knowledge proofs only
- **Portfolio strategies**: Completely invisible to competitors

---

## 🚀 Quick Start

### 📋 Prerequisites

- **Node.js** 18+ 
- **Rust** 1.75+ with Solana toolchain
- **Solana CLI** 1.18+
- **Anchor Framework** 0.31.1
- **Arcium CLI** - For MPC network interaction

### ⚡ Installation

```bash
# Clone the repository with submodules
git clone --recurse-submodules https://github.com/undefinedlab/siphon_sol.git
cd siphon_sol

# Install dependencies
npm install

# Install Arcium CLI (see: https://docs.arcium.com/developers/installation)
# Then build the dark pool matching engine
cd matching-engine
yarn install
arcium build
cd ..

# Start Arcium localnet (in separate terminal)
arcium localnet

# Run development server
npm run dev
```

🌐 Open [http://localhost:3000](http://localhost:3000) to see the application.

### 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 🚀 Start development server |
| `npm run build` | 🏗️ Build for production |
| `npm run start` | ▶️ Start production server |
| `npm run lint` | 🔍 Run ESLint |
| `npm run test` | 🧪 Run tests |
| `arcium test` | 🔒 Test dark pool matching engine |

---

## 🤝 Contributing

### 🚀 Getting Started

1. **Fork** the repository
2. **Clone with submodules** (`git clone --recurse-submodules`)
3. **Create** a feature branch (`git checkout -b feature/privacy-enhancement`)
4. **Commit** your changes (`git commit -m 'Add privacy feature'`)
5. **Push** to the branch (`git push origin feature/privacy-enhancement`)
6. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

> **This software is in testing phase development and should be used for testing purposes only.**

---

<div align="center">

## 🌊 **Siphon Protocol**

**Built with ❤️ for Financial Freedom**

</div>ncial Freedom**

</div>
