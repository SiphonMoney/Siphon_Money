<div align="left">

# Siphon Protocol

> **Trade in the Shadows, Verify in the Light**
> 
> The first truly private DEX where users can see their balances but not others' - powered by Multi-Party Computation on Solana.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-1.18-purple?style=for-the-badge&logo=solana)](https://solana.com/)
[![Arcium](https://img.shields.io/badge/Arcium-MPC-orange?style=for-the-badge)](https://arcium.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[🚀 Live Demo](https://siphon.money) | [🐦 Twitter](https://x.com/SiphonMoney)

</div>

---

## 🚀 What Makes This Special?

Traditional DEXs are **completely transparent** - everyone sees your balances, orders, and trading patterns. Privacy solutions like Tornado Cash are **completely opaque** - you can't even see your own balance without trial-and-error.

**We solved both problems.**

### The Innovation: User-Decryptable Encrypted Balances

```mermaid
graph LR
    A[Your Private Key] -->|x25519 ECDH| B[Shared Secret]
    C[MPC Public Key] -->|x25519 ECDH| B
    B -->|Decrypt| D[Your Balance: 100 SOL]
    E[On-Chain State] -->|Enc<Shared, Balance>| D
    
    style A fill:#4CAF50
    style C fill:#2196F3
    style D fill:#FF9800
    style E fill:#9C27B0
```

**You** can decrypt your balance. **MPC** can validate operations. **Nobody else** can see anything.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ 🎨 Frontend Layer (React + TypeScript)                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ • Wallet Connection (Phantom, Solflare, etc.)           │ │
│ │ • x25519 Key Management (localStorage + encryption)     │ │
│ │ • Balance Decryption Engine (RescueCipher)              │ │
│ │ • Real-time WebSocket Client                            │ │
│ │ • Transaction Builder (Anchor integration)              │ │
│ │ • Responsive UI (Tailwind CSS)                          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTPS + WebSocket
┌─────────────────────────────────────────────────────────────┐
│ 🔧 Backend Services (Node.js + PostgreSQL)                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Event Indexer                                           │ │
│ │ ├─ Listens to Solana program events                    │ │
│ │ ├─ Stores events in PostgreSQL                         │ │
│ │ └─ Broadcasts via WebSocket                            │ │
│ │                                                          │ │
│ │ REST API Server                                         │ │
│ │ ├─ GET /balances/:user                                  │ │
│ │ ├─ GET /withdrawals/:user                               │ │
│ │ ├─ GET /orders/:user (future)                           │ │
│ │ └─ Historical data queries                              │ │
│ │                                                          │ │
│ │ WebSocket Server                                        │ │
│ │ ├─ Real-time event streaming                            │ │
│ │ ├─ User-specific filtering (pubkey subscription)        │ │
│ │ └─ Event types: deposit, withdraw, order fill          │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🤖 Cranker Bot (Automated Withdrawal Executor)          │ │
│ │ ├─ Listens: UserLedgerWithdrawVerifiedSuccessEvent     │ │
│ │ ├─ Validates: Event authenticity + user signature       │ │
│ │ ├─ Executes: withdraw_from_vault(user, amount)          │ │
│ │ └─ Signs with authorized keypair                        │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕ RPC Calls
┌─────────────────────────────────────────────────────────────┐
│ ⚡ Solana Program (Anchor + Arcium MPC)                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ UserPrivateLedger Accounts (PDA)                        │ │
│ │ ├─ owner: Pubkey                                        │ │
│ │ ├─ encrypted_balances: [[u8; 32]; 4]  ← Enc<Shared>    │ │
│ │ ├─ balance_nonce: u128                                  │ │
│ │ └─ last_update: i64                                     │ │
│ │                                                          │ │
│ │ SPL Token Vaults (PDA)                                  │ │
│ │ ├─ vault_authority: PDA (program-controlled)            │ │
│ │ ├─ base_vault: TokenAccount (SOL)                       │ │
│ │ └─ quote_vault: TokenAccount (USDC)                     │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕ Computation Queue
┌─────────────────────────────────────────────────────────────┐
│ 🔐 Arcium MPC Network                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Encrypted Circuits (encrypted-ixs)                      │ │
│ │ ├─ init_user_ledger(user_pubkey) → Enc<Shared, 0>      │ │
│ │ ├─ update_ledger_deposit(bal, amt) → Enc<Shared, new>  │ │
│ │ ├─ update_ledger_withdraw(bal, amt) → (Enc<..>, bool)  │ │
│ │ ├─ submit_order(book, order) → Enc<Mxe, OrderBook>     │ │
│ │ ├─ match_orders(book) → Enc<Shared, Matches>           │ │
│ │ └─ execute_settlement(u1, u2, amt) → (Enc<..>, Enc<..>)│ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 User Journeys

### Journey 1: First-Time Deposit

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Wallet
    participant Solana
    participant MPC
    participant Backend
    
    User->>Frontend: Click "Deposit 100 SOL"
    Frontend->>Wallet: Request signature
    Wallet->>User: Approve transaction?
    User->>Wallet: ✅ Approve
    Wallet->>Solana: deposit_to_ledger(100)
    
    Note over Solana: SPL Transfer: User → Vault
    
    Solana->>MPC: Queue: update_ledger_deposit
    MPC->>MPC: Decrypt balance: 0<br/>Add: 0 + 100 = 100<br/>Re-encrypt with new nonce
    MPC->>Solana: Callback with Enc<Shared, 100>
    
    Note over Solana: Update UserPrivateLedger<br/>Emit UserLedgerDepositedEvent
    
    Solana->>Backend: Event: { user, nonce, encrypted_balances }
    Backend->>Frontend: WebSocket: DepositEvent
    
    Frontend->>Frontend: x25519.decrypt(encrypted_balances)
    Frontend->>User: 🎉 Balance: 100 SOL
```

**Time to completion:** ~5-10 seconds (MPC computation + finalization)

---

### Journey 2: Withdrawal (Two-Step Process)

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Solana
    participant MPC
    participant Cranker
    participant Backend
    
    User->>Frontend: Click "Withdraw 30 SOL"
    Frontend->>Solana: withdraw_from_ledger_verify(30)
    
    Solana->>MPC: Queue: verify withdrawal
    MPC->>MPC: Decrypt balance: 100<br/>Check: 100 >= 30? ✅<br/>Subtract: 100 - 30 = 70<br/>Re-encrypt
    MPC->>Solana: Callback: (Enc<Shared, 70>, true)
    
    Note over Solana: Update encrypted balance<br/>Emit WithdrawVerifiedSuccessEvent
    
    Solana->>Backend: Event: { user, amount: 30 }
    Backend->>Cranker: 🔔 Withdrawal verified!
    Backend->>Frontend: WebSocket: WithdrawPending
    
    Cranker->>Cranker: Validate event signature
    Cranker->>Solana: withdraw_from_vault(30, user)
    
    Note over Solana: SPL Transfer: Vault → User<br/>Signed by cranker bot<br/>Emit WithdrawEvent
    
    Solana->>Backend: Event: { user, amount: 30 }
    Backend->>Frontend: WebSocket: WithdrawComplete
    Frontend->>User: ✅ 30 SOL in your wallet!
```

**Why two steps?**
1. **Step 1 (MPC)**: Validate balance cryptographically → Lock funds in encrypted state
2. **Step 2 (Cranker)**: Execute actual token transfer after validation

This prevents **unauthorized withdrawals** even if an attacker compromises the cranker bot.

---

### Journey 3: Order Submission (Future)

```mermaid
sequenceDiagram
    actor Trader
    participant Frontend
    participant Solana
    participant MPC
    participant Backend
    
    Trader->>Frontend: Place order: Buy 10 SOL @ 105 USDC
    Frontend->>Frontend: Encrypt: x25519(price=105, qty=10)
    Frontend->>Solana: submit_order(encrypted_order)
    
    Solana->>MPC: Queue: add to orderbook
    MPC->>MPC: Decrypt orderbook<br/>Insert order (encrypted)<br/>Re-encrypt entire book
    MPC->>Solana: Callback: Enc<Mxe, NewOrderBook>
    
    Note over Solana: OrderBook updated<br/>Emit OrderProcessedEvent<br/>{ order_id, status: "pending" }
    
    Solana->>Backend: Event: OrderProcessed
    Backend->>Frontend: WebSocket: OrderAccepted
    Frontend->>Trader: ✅ Order #42 placed!
    
    Note over Trader: Trader CANNOT see:<br/>• Other orders<br/>• Liquidity depth<br/>• Market spread<br/><br/>Only MPC sees full orderbook
```

---

## 🖥️ Frontend Features

### Dashboard
```
┌────────────────────────────────────────────────────────────┐
│  Dark Pool DEX                              [Connect Wallet]│
├────────────────────────────────────────────────────────────┤
│                                                             │
│  💰 Your Private Balance                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SOL:  100.5 ████████████████████░░░░  (Available)   │  │
│  │       +120.0 ████████████████████████  (Total)       │  │
│  │                                                       │  │
│  │  USDC: 5,432 ████████████████░░░░░░░░  (Available)   │  │
│  │       +6,000 ████████████████████████  (Total)       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  🔐 Encrypted State: Verified ✓                            │
│  Last Updated: 2 minutes ago                               │
│  Nonce: 42                                                 │
│                                                             │
│  [Deposit]  [Withdraw]  [Trade]                            │
│                                                             │
├────────────────────────────────────────────────────────────┤
│  📊 Recent Activity                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🟢 Deposit    +100 SOL        2 min ago              │  │
│  │ 🔴 Withdraw   -30 SOL         5 min ago   [Receipt]  │  │
│  │ 🟡 Order #41  Filled @ 103    10 min ago  [Details]  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Withdrawal Modal
```
┌────────────────────────────────────────────┐
│  Withdraw SOL                          [X] │
├────────────────────────────────────────────┤
│                                            │
│  Amount                                    │
│  ┌──────────────────────────────────────┐ │
│  │ 30                              [MAX]│ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Available: 100.5 SOL                     │
│                                            │
│  ⚠️  Two-step withdrawal:                 │
│  1. MPC validates balance (5-10s)         │
│  2. Cranker executes transfer (3-5s)      │
│                                            │
│  Total time: ~15 seconds                  │
│                                            │
│  [Cancel]              [Withdraw 30 SOL]  │
└────────────────────────────────────────────┘
```

### Key Management
```
┌────────────────────────────────────────────┐
│  🔑 Encryption Keys                    [X] │
├────────────────────────────────────────────┤
│                                            │
│  Your x25519 Private Key                  │
│  ┌──────────────────────────────────────┐ │
│  │ fa3b7c...9d2e (hidden)         [👁️]│ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Storage: Browser localStorage (encrypted)│
│  Encryption: AES-256-GCM with wallet key  │
│                                            │
│  ⚠️  Important:                            │
│  • Never share this key                   │
│  • Backup securely (not screenshot!)      │
│  • Required to decrypt your balance       │
│                                            │
│  [Export Backup]  [Delete Key]            │
└────────────────────────────────────────────┘
```

---

## 🔧 Backend Services

### 1. Event Indexer

**Purpose:** Listen to all program events and persist to database

```typescript
// services/eventIndexer.ts
class EventIndexer {
  async start() {
    // Subscribe to program event logs
    connection.onLogs(programId, (logs) => {
      const events = parseEvents(logs);
      
      for (const event of events) {
        switch (event.name) {
          case 'UserLedgerDepositedEvent':
            await db.deposits.create({
              user: event.data.user,
              nonce: event.data.balanceNonce,
              encryptedBalances: event.data.encryptedBalances,
              timestamp: event.data.lastUpdate
            });
            
            // Broadcast to WebSocket clients
            wss.sendToUser(event.data.user, {
              type: 'deposit',
              data: event.data
            });
            break;
            
          case 'UserLedgerWithdrawVerifiedSuccessEvent':
            await db.withdrawals.create({
              user: event.data.user,
              status: 'verified',
              // ... store event data
            });
            
            // Notify cranker bot
            crankerQueue.add({ event: event.data });
            break;
        }
      }
    });
  }
}
```

### 2. REST API

**Endpoints:**

```typescript
// GET /api/v1/balance/:user
// Returns latest encrypted balance from database
{
  "user": "HN7cAB...",
  "encryptedBalances": [
    [123, 45, 67, ...],  // 4 chunks of 32 bytes
    [...],
    [...],
    [...]
  ],
  "nonce": 42,
  "lastUpdate": 1699564234
}

// GET /api/v1/withdrawals/:user
// Returns withdrawal history
{
  "withdrawals": [
    {
      "id": "abc123",
      "amount": 30,
      "status": "completed",
      "verifiedAt": 1699564200,
      "executedAt": 1699564210,
      "txSignature": "5kF7..."
    }
  ]
}

// GET /api/v1/orders/:user (future)
// Returns order history
{
  "orders": [
    {
      "id": 41,
      "type": "buy",
      "status": "filled",
      "filledAt": 1699564100
    }
  ]
}
```

### 3. WebSocket Server

**Connection:**

```typescript
// Client-side
const ws = new WebSocket('wss://api.darkpool.xyz/ws');

// Subscribe to user-specific events
ws.send(JSON.stringify({
  type: 'subscribe',
  user: walletPublicKey.toBase58()
}));

// Receive events
ws.onmessage = (msg) => {
  const event = JSON.parse(msg.data);
  
  switch (event.type) {
    case 'deposit':
      // Update balance in UI
      updateBalance(event.data);
      break;
      
    case 'withdraw_verified':
      // Show "Processing withdrawal..."
      showPendingWithdrawal(event.data);
      break;
      
    case 'withdraw_complete':
      // Show "Withdrawal complete!"
      showSuccessToast(event.data);
      break;
  }
};
```

### 4. Cranker Bot

**Purpose:** Execute verified withdrawals automatically

```typescript
// services/crankerBot.ts
class CrankerBot {
  private keypair: Keypair; // 8wJE7H7svhpz...
  
  async start() {
    // Listen for verified withdrawals
    program.addEventListener('UserLedgerWithdrawVerifiedSuccessEvent', 
      async (event) => {
        console.log(`Withdrawal verified for ${event.user}`);
        
        // Validate event authenticity
        if (!this.validateEvent(event)) {
          console.error('Invalid event signature!');
          return;
        }
        
        // Execute withdrawal
        try {
          const tx = await program.methods
            .withdrawFromVault(event.amount, event.user)
            .accounts({
              payer: this.keypair.publicKey,
              vaultAuthority: vaultAuthorityPDA,
              vault: vaultPDA,
              userTokenAccount: userATA,
              // ...
            })
            .signers([this.keypair])
            .rpc();
            
          console.log(`✅ Withdrawal executed: ${tx}`);
          
        } catch (error) {
          console.error(`❌ Withdrawal failed: ${error}`);
          // Implement retry logic
        }
      }
    );
  }
}
```

---

## 📊 Database Schema

```sql
-- PostgreSQL Schema

-- Users table
CREATE TABLE users (
  pubkey VARCHAR(44) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP
);

-- Balances (cached from events)
CREATE TABLE balances (
  id SERIAL PRIMARY KEY,
  user_pubkey VARCHAR(44) REFERENCES users(pubkey),
  encrypted_balances BYTEA,  -- Store as binary
  balance_nonce NUMERIC(39, 0),  -- u128
  last_update BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_pubkey)
);

-- Deposits
CREATE TABLE deposits (
  id SERIAL PRIMARY KEY,
  user_pubkey VARCHAR(44) REFERENCES users(pubkey),
  amount BIGINT,
  token VARCHAR(10),  -- 'SOL' or 'USDC'
  tx_signature VARCHAR(88),
  balance_nonce NUMERIC(39, 0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Withdrawals
CREATE TABLE withdrawals (
  id SERIAL PRIMARY KEY,
  user_pubkey VARCHAR(44) REFERENCES users(pubkey),
  amount BIGINT,
  token VARCHAR(10),
  status VARCHAR(20),  -- 'verified', 'executing', 'completed', 'failed'
  verify_tx VARCHAR(88),
  execute_tx VARCHAR(88),
  verified_at TIMESTAMP,
  executed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders (future)
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id BIGINT,
  user_pubkey VARCHAR(44) REFERENCES users(pubkey),
  order_type VARCHAR(10),  -- 'buy' or 'sell'
  status VARCHAR(20),  -- 'pending', 'filled', 'cancelled'
  tx_signature VARCHAR(88),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_balances_user ON balances(user_pubkey);
CREATE INDEX idx_deposits_user ON deposits(user_pubkey);
CREATE INDEX idx_withdrawals_user ON withdrawals(user_pubkey);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_orders_user ON orders(user_pubkey);
```

---

## 🔐 Frontend Security

### Key Management Strategy

```typescript
// utils/keyManagement.ts

/**
 * Generate or retrieve user's x25519 keypair
 * Stored encrypted in localStorage with wallet's signature as key
 */
export async function getOrCreateUserKeys(
  wallet: WalletContextState
): Promise<{ privateKey: Uint8Array; publicKey: Uint8Array }> {
  
  const storageKey = `x25519_keys_${wallet.publicKey.toBase58()}`;
  
  // Check if keys exist
  const encrypted = localStorage.getItem(storageKey);
  
  if (encrypted) {
    // Decrypt with wallet signature
    const message = "Decrypt my balance encryption keys";
    const signature = await wallet.signMessage(
      new TextEncoder().encode(message)
    );
    
    const privateKey = await decryptWithSignature(encrypted, signature);
    const publicKey = x25519.getPublicKey(privateKey);
    
    return { privateKey, publicKey };
  }
  
  // Generate new keys
  const privateKey = x25519.generateSecretKey();
  const publicKey = x25519.getPublicKey(privateKey);
  
  // Encrypt and store
  const message = "Encrypt my balance encryption keys";
  const signature = await wallet.signMessage(
    new TextEncoder().encode(message)
  );
  
  const encrypted = await encryptWithSignature(privateKey, signature);
  localStorage.setItem(storageKey, encrypted);
  
  return { privateKey, publicKey };
}

/**
 * Decrypt user's balance from encrypted state
 */
export async function decryptBalance(
  encryptedBalances: Uint8Array[],
  nonce: bigint,
  userPrivateKey: Uint8Array,
  mxePublicKey: Uint8Array
): Promise<{ base_total: bigint; base_available: bigint; quote_total: bigint; quote_available: bigint }> {
  
  // Derive shared secret
  const sharedSecret = x25519.getSharedSecret(userPrivateKey, mxePublicKey);
  
  // Initialize cipher
  const cipher = new RescueCipher(sharedSecret);
  
  // Decrypt 4 chunks (base_total, base_available, quote_total, quote_available)
  const balances = cipher.decrypt(encryptedBalances, nonce);
  
  return {
    base_total: deserializeLE(balances[0]),
    base_available: deserializeLE(balances[1]),
    quote_total: deserializeLE(balances[2]),
    quote_available: deserializeLE(balances[3])
  };
}
```

### React Components

```typescript
// components/BalanceDisplay.tsx
export function BalanceDisplay() {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!publicKey) return;
    
    // Fetch encrypted balance from backend
    fetchBalance(publicKey.toBase58()).then(async (data) => {
      // Get user's x25519 keys
      const { privateKey } = await getOrCreateUserKeys(wallet);
      
      // Get MXE public key
      const mxePublicKey = await getMXEPublicKey();
      
      // Decrypt balance
      const decrypted = await decryptBalance(
        data.encryptedBalances,
        data.nonce,
        privateKey,
        mxePublicKey
      );
      
      setBalance(decrypted);
      setLoading(false);
    });
    
    // Subscribe to real-time updates
    const ws = new WebSocket('wss://api.darkpool.xyz/ws');
    ws.send(JSON.stringify({
      type: 'subscribe',
      user: publicKey.toBase58()
    }));
    
    ws.onmessage = async (msg) => {
      const event = JSON.parse(msg.data);
      if (event.type === 'deposit' || event.type === 'withdraw_complete') {
        // Re-decrypt updated balance
        const { privateKey } = await getOrCreateUserKeys(wallet);
        const mxePublicKey = await getMXEPublicKey();
        const decrypted = await decryptBalance(
          event.data.encryptedBalances,
          event.data.balanceNonce,
          privateKey,
          mxePublicKey
        );
        setBalance(decrypted);
      }
    };
    
    return () => ws.close();
  }, [publicKey]);
  
  if (loading) return <Spinner />;
  
  return (
    <div className="balance-card">
      <h2>Your Private Balance</h2>
      <div className="balance-item">
        <span>SOL</span>
        <span>{formatBalance(balance.base_available)} / {formatBalance(balance.base_total)}</span>
      </div>
      <div className="balance-item">
        <span>USDC</span>
        <span>{formatBalance(balance.quote_available)} / {formatBalance(balance.quote_total)}</span>
      </div>
    </div>
  );
}
```

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_SOLANA_RPC": "https://api.devnet.solana.com",
    "VITE_PROGRAM_ID": "DQ5MR2aPD9sPBN9ukVkhwrAn8ADxpkAE5AHUnXxKEvn1",
    "VITE_BACKEND_URL": "https://api.darkpool.xyz",
    "VITE_WS_URL": "wss://api.darkpool.xyz/ws"
  }
}
```

### Backend (Railway / Fly.io)
```bash
# docker-compose.yml
version: '3.8'
services:
  api:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/darkpool
      - SOLANA_RPC=https://api.devnet.solana.com
      - PROGRAM_ID=DQ5MR2aPD9sPBN9ukVkhwrAn8ADxpkAE5AHUnXxKEvn1
    ports:
      - "3000:3000"
  
  indexer:
    build: ./backend
    command: npm run indexer
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/darkpool
      - SOLANA_RPC=https://api.devnet.solana.com
  
  cranker:
    build: ./backend
    command: npm run cranker
    environment:
      - CRANKER_KEYPAIR=/secrets/cranker_bot.json
    volumes:
      - ./secrets:/secrets:ro
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=darkpool
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Cranker Bot (Systemd Service)
```ini
# /etc/systemd/system/cranker-bot.service
[Unit]
Description=Dark Pool Cranker Bot
After=network.target

[Service]
Type=simple
User=darkpool
WorkingDirectory=/opt/darkpool/backend
Environment="NODE_ENV=production"
Environment="CRANKER_KEYPAIR=/secrets/cranker_bot.json"
ExecStart=/usr/bin/npm run cranker
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

---

## 📈 Monitoring & Observability

### Key Metrics

**Frontend:**
- Balance decryption time (should be <100ms)
- WebSocket reconnection rate
- Transaction success rate
- User session duration

**Backend:**
- Event processing latency (indexer)
- Database query performance
- WebSocket connection count
- API response times

**Cranker:**
- Withdrawal execution success rate
- Average execution time (Step 1 → Step 2)
- Failed withdrawal count
- SOL balance (for transaction fees)

### Grafana Dashboard

```yaml
# Example metrics
- name: withdrawal_latency
  query: histogram_quantile(0.95, rate(withdrawal_duration_seconds_bucket[5m]))
  
- name: indexer_lag
  query: time() - max(last_indexed_block_timestamp)
  
- name: cranker_balance
  query: cranker_bot_sol_balance
  alert_threshold: 5  # Alert if < 5 SOL
```

---

## 🎓 Technical Challenges Solved

### 1. Large Encrypted Data Problem
**Challenge:** OrderBook encryption produces 1,344 bytes, exceeding Solana callback limits

**Solution:** Callback server pattern (future implementation)
- MPC posts large encrypted data to off-chain server
- Callback only contains reference hash
- Frontend fetches from callback server

### 2. User Balance Transparency
**Challenge:** Traditional privacy systems hide balances from users too

**Solution:** Dual-encryption scheme
- `Enc<Shared, Balances>` for user ledgers (user + MPC can decrypt)
- `Enc<Mxe, OrderBook>` for orderbook (only MPC can decrypt)

### 3. Withdrawal Security
**Challenge:** How to prevent unauthorized withdrawals while maintaining privacy?

**Solution:** Two-step verification
- Step 1: MPC validates on encrypted data
- Step 2: Cranker executes only after cryptographic proof

### 4. Real-Time Updates
**Challenge:** Solana events don't persist, how do users see history?

**Solution:** Event indexer architecture
- Backend listens 24/7, stores all events
- PostgreSQL for queryable history
- WebSocket for real-time push
- REST API for historical queries

---

## 🔮 Roadmap

### Phase 1: MVP (Current)
- ✅ User-decryptable balance management
- ✅ Deposit flow
- ✅ Two-step withdrawal
- ✅ Event emission
- ⏳ Frontend implementation
- ⏳ Backend event indexer

### Phase 2: Trading
- [ ] Order submission UI
- [ ] Callback server for large encrypted data
- [ ] Order matching engine
- [ ] Settlement execution
- [ ] Order history / portfolio view

### Phase 3: Advanced Features
- [ ] Limit orders + order types
- [ ] Price charts (aggregated, no order-level data)
- [ ] Mobile app
- [ ] Notifications (email/SMS for fills)

### Phase 4: Scale
- [ ] Multiple trading pairs
- [ ] Cross-chain deposits (Wormhole)
- [ ] Liquidity mining
- [ ] Governance token

---

## 💎 Why This Matters

**For Traders:**
- 🔒 **Privacy**: Trade without revealing your strategy
- 💰 **No MEV**: Orders invisible to bots and sandwich attacks
- 📊 **Transparency**: You always know your exact balance
- ⚡ **Speed**: Solana's 400ms finality

**For DeFi:**
- 🏗️ **Composability**: Can integrate with existing DeFi protocols
- 🌐 **Censorship Resistance**: No KYC, no geographical restrictions
- 🔐 **Self-Custody**: You always control your keys
- 🚀 **Innovation**: First truly private yet transparent DEX

**For the Ecosystem:**
- 🧪 **MPC Research**: Pushes boundaries of encrypted computation
- 📚 **Open Source**: Full code available for audit and learning
- 🛠️ **Developer Tools**: Reusable patterns for future privacy dApps
- 🌟 **Proof of Concept**: Shows what's possible with Arcium MPC

---

## 📚 Resources

### Documentation
- [Smart Contract README](./README.md) - Program architecture
- [Event Handling Architecture](./EVENT_HANDLING_ARCHITECTURE.md)
- [Frontend Quickstart](./FRONTEND_QUICKSTART.md)
- [Withdrawal Test Guide](./WITHDRAWAL_TEST_GUIDE.md)

### External Links
- [Arcium Documentation](https://docs.arcium.com)
- [Solana Cookbook](https://solanacookbook.com)
- [Anchor Framework](https://www.anchor-lang.com)

### Community
- Discord: (coming soon)
- Twitter: (coming soon)
- GitHub: (this repo)

---

## 🤝 Contributing

We welcome contributions! Areas where help is needed:

**Frontend:**
- React component library
- Real-time WebSocket client
- Balance decryption optimization
- Mobile responsive design

**Backend:**
- Event indexer performance tuning
- PostgreSQL query optimization
- WebSocket scaling (Redis pub/sub)
- Monitoring/alerting setup

**Smart Contracts:**
- Callback server implementation
- Order matching optimization
- Gas optimization
- Security audits

---

## ⚠️ Disclaimer

This is an **experimental prototype** built for educational and research purposes.

- ❌ **NOT audited** for production use
- ❌ **NOT financial advice**
- ❌ **USE AT YOUR OWN RISK**

Always test on devnet first. Never invest more than you can afford to lose.

---

## 📄 License

GPL v3 - See [LICENSE](./LICENSE)

---

## 🙏 Acknowledgments

- **Arcium Team** - For building the MPC network that makes this possible
- **Solana Foundation** - For the blazing fast blockchain
- **Open Source Community** - For the tools and libraries

---

<p align="center">
  <b>Built with ❤️ by developers who believe privacy is a right, not a luxury</b>
</p>

<p align="center">
  <i>"The best way to predict the future is to invent it."</i> - Alan Kay
</p>
