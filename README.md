<div align="left">

# 🌊 Siphon Protocol

> **Enabling untraceable, hyperliquid and institutional-grade DeFi privacy**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-1.18-purple?style=for-the-badge&logo=solana)](https://solana.com/)
[![Arcium](https://img.shields.io/badge/Arcium-MPC-orange?style=for-the-badge)](https://arcium.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[🚀 Live Demo](https://siphon.money) | [🐦 Twitter](https://x.com/SiphonMoney)

</div>

---
 
## 🎯 The Problem We Solve

### ⚠️ Three Critical Privacy Crises in DeFi:

<table>
<tr>
<td width="33%">


#### 🔍 **Wallets Are Tracked**
- **Chain analytics links addresses** timing, and flows into identities.
- **Your PNL**, history and every move are visible.

</td>
<td width="33%">

#### 🤖 **Value is Extracted**
- **Visible flow**  widens quotes and worsens fills.
- **Sniping and MEV**  extraction destroys profitability.

</td>
<td width="33%">

#### 💰 **Liquidity is Siloed**
- **Privacy coins** and pools lack DeFi integration
- **Users forced** to choose: privacy OR best execution

</td>
</tr>
</table>

### 📊 Market Reality
- **$300M+** lost monthly to front-running attacks on DEXs 
- **$12B** in privacy coin market cap lacks DeFi integration
- **Zero** truly private DEXs with easy access to global liquidity

---

## 🚀 The Siphon Protocol

### 🌉 **The Solana Privacy Box**

**Siphon serves as the seamless privacy-preserving gateway between public and private capital, facilitating secure, private and verifiable movement of assets across multiple blockchains. By enabling frictionless access to the deepest, most liquid DeFi opportunities in a true omnichain environment, Siphon empowers institutions and individuals alike to transact and deploy strategies at scale—without sacrificing confidentiality, competitive edge, or market efficiency.**
</div>


### ✨ Key Features

<table>
<tr>
<td width="50%">

#### 🔒 **Private Identity** 
- Portfolio, PnL, and strategies are no longer visible on-chain
- Encrypted state management

#### ⚡ **Private execution**
- Eliminates order sniffing and MEV extraction
- Private transaction routing

</td>
<td width="50%">

#### 💰 **Better Pricing**
- Cheaper transaction prices through optimized execution
- Reduced slippage through privacy-preserving routing

#### 🌐 **Omnichain Routing**
- Hyperliquid execution across multiple chains
- Privacy preserved end-to-end

</td>
</tr>
</table>

<img src="https://github.com/undefinedlab/siphon_money/blob/master/docs/protocol.png" alt="Siphon Architecture Diagram" width="100%" />


---

## 🛠️ Technical Architecture

### 🔧 Core Technologies
<table>
  <tr>
    <td width="33%" align="center">

#### 🔐 **FHE**  
**Fully Homomorphic Encryption**  
Enables computation on encrypted data

  </td>
    <td width="33%" align="center">

#### 🎭 **ZK Proofs**  
**Zero-Knowledge Proofs**  
Proves correctness—no data revealed

  </td>
    <td width="33%" align="center">

#### 🌉 ** Arcium (MPC)*  
**Multi‑Party Computation Execution**  
Decentralized MPC network for private, verifiable off‑chain/on‑chain computation

  </td>
  </tr>

  <tr>
    <td width="33%" align="center">

#### 🔁 Atomic swaps**  
**Cross‑chain, trustless asset exchange**  
Peer‑to‑peer on/off‑ramp and private coin swapping


  </td>
    <td width="33%" align="center">

#### ⚙️ **Solana**  
**Execution & Settlement Layer**  
Secure, composable, and composable foundation for DeFi.

  </td>
  </tr>
</table>


### The Five-Layer Architecture:

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: Liquidity Interface                                │
│ - Public DEX aggregators                                    │
│ - Cross-chain bridges                                       │
│ - Modular design for privacy-native assets                  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Verification & Settlement                          │
│ - ZK proof of correct execution                             │
│ - On-chain verification                                     │
│ - Cryptographic guarantees                                  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Confidential Execution Environment (FHE Engine)    │
│ - Encrypted mempool                                         │
│ - Computation on encrypted data                             │
│ - Order matching & slippage calculation                     │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Shielded Pool                                      │
│ - Incremental Merkle trees                                  │
│ - Zero-knowledge membership proofs                          │
│ - Nullifier system for double-spend prevention              │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Vault Contract                                     │
│ - Trustless escrow for public assets                        │
│ - ETH, USDC, WBTC and more                                  │
│ - Release on valid ZK proof verification                    │
└─────────────────────────────────────────────────────────────┘
```


## ⚖️ Compliance & Regulatory Considerations

Siphon Protocol should integrate multiple compliance mechanisms to address regulatory requirements while maintaining core privacy principles:

### 🛡️ Risk Screening Gate
- **On-Chain Risk Oracle Integration**: Funds entering the Siphon Vault must pass validation through established risk oracles (e.g., Chainalysis, TRM, or in-protocol scoring systems)
- **Source Verification**: Addresses are screened against known restricted or sanctioned lists before admission

### 🔐 Zero-Knowledge Proof of Compliance
- **Privacy-Preserving Verification**: Users can prove they meet KYC/AML requirements without revealing identity
- **Compliant Service Provider Integration**: Works with compliance providers to generate non-revealing proofs
- **Address Sanctioning**: Demonstrates funds are not from restricted address lists, cryptographically

### 📊 Verifiable Transparency Layer
- **Per-Batch Proofs**: Each execution batch emits a zero-knowledge event proving:
  - Encrypted trades were executed correctly
  - State updates followed protocol rules
  - Fees were computed and distributed correctly
  - All without revealing underlying sensitive data
- **Cryptographic Guarantees**: Mathematical proofs ensure system integrity
- **Audit Trail**: Maintains verifiable record of protocol correctness while preserving user privacy

> **Note**: These compliance mechanisms are part of the architectural design and serve to demonstrate how privacy and regulatory compliance can coexist. Real-world implementation would require integration with licensed compliance service providers and legal frameworks.



### 🚀 DarkPool Workflow

https://github.com/arnabnandikgp/matching-engine/blob/main/UPDATED_IN_APP_SETTLEMENT_ARCHITECTURE.md


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
</div>
