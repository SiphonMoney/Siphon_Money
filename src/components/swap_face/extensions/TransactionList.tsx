"use client";

import { useState, useEffect, useCallback } from "react";

interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  total: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionListProps {
  poolPair: string;
  maxItems?: number;
}

export default function TransactionList({ poolPair, maxItems }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');

  // Generate mock transaction data
  const generateMockTransactions = useCallback(() => {
    const mockTransactions: Transaction[] = [];
    const now = new Date();
    
    for (let i = 0; i < 20; i++) {
      const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000); // Every 5 minutes
      const isBuy = Math.random() > 0.5;
      const amount = Math.random() * 100 + 10;
      const price = poolPair.includes('SOL') ? 150 + Math.random() * 10 : 
                   poolPair.includes('ETH') ? 3000 + Math.random() * 100 : 
                   45000 + Math.random() * 1000;
      
      mockTransactions.push({
        id: `tx_${i.toString().padStart(3, '0')}`,
        type: isBuy ? 'buy' : 'sell',
        amount: Math.round(amount * 100) / 100,
        price: Math.round(price * 100) / 100,
        total: Math.round(amount * price * 100) / 100,
        timestamp: timestamp.toISOString().slice(11, 19), // HH:MM:SS
        status: Math.random() > 0.1 ? 'completed' : 'pending',
      });
    }
    
    return mockTransactions;
  }, [poolPair]);

  useEffect(() => {
    const load = () => {
      setIsLoading(true);
      // Load locally stored transactions first
      let local: Transaction[] = [];
      try {
        const raw = localStorage.getItem('siphon-mock-transactions');
        if (raw) local = JSON.parse(raw);
      } catch {}

      // Filter by pair and sort latest first
      const localForPair = local
        .filter((t) => t && typeof t === 'object')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((t) => (t as any).pair === poolPair)
        .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

      // Merge with generated mocks to fill remaining slots
      const mocks = generateMockTransactions();
      const merged = [...localForPair, ...mocks].slice(0, maxItems ?? 9999);

      setTransactions(merged);
      setIsLoading(false);
    };

    load();

    const onUpdate = () => load();
    window.addEventListener('siphon-tx-updated', onUpdate);
    return () => window.removeEventListener('siphon-tx-updated', onUpdate);
  }, [poolPair, generateMockTransactions, maxItems]);

  const filteredTransactions = transactions
    .filter(tx => filter === 'all' || tx.type === filter)
    .slice(0, maxItems ?? transactions.length);

  // Emit current visible volume for this pair
  useEffect(() => {
    const volume = filteredTransactions.reduce((acc, t) => acc + (t.total || 0), 0);
    const evt = new CustomEvent('siphon-tx-volume', { detail: { pair: poolPair, volume } });
    window.dispatchEvent(evt);
  }, [filteredTransactions, poolPair]);

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatAmount = (amount: number) => {
    return amount.toFixed(2);
  };

  const formatTotal = (total: number) => {
    if (total >= 1000000) {
      return `$${(total / 1000000).toFixed(1)}M`;
    } else if (total >= 1000) {
      return `$${(total / 1000).toFixed(1)}K`;
    }
    return `$${total.toFixed(0)}`;
  };

  if (isLoading) {
    return (
      <div className="transaction-list loading">
        <div className="list-header">
          <h4>Recent Transactions</h4>
          <div className="loading-spinner"></div>
        </div>
        <div className="list-placeholder">
          <div className="loading-text">Loading transactions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <div className="list-header">
        <h4>Recent Transactions</h4>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'buy' ? 'active' : ''}`}
            onClick={() => setFilter('buy')}
          >
            Buys
          </button>
          <button 
            className={`filter-btn ${filter === 'sell' ? 'active' : ''}`}
            onClick={() => setFilter('sell')}
          >
            Sells
          </button>
        </div>
      </div>
      
      <div className="transaction-table">
        <div className="table-header">
          <span>Type</span>
          <span>Amount</span>
          <span>Price</span>
          <span>Total</span>
          <span>Time</span>
          <span>Counterparty</span>
        </div>
        
        <div className="table-body">
          {filteredTransactions.map((tx) => (
            <div key={tx.id} className={`table-row ${tx.type}`}>
              <span className={`tx-type ${tx.type}`}>
                {tx.type === 'buy' ? '🟢 Buy' : '🔴 Sell'}
              </span>
              <span className="tx-amount">{formatAmount(tx.amount)}</span>
              <span className="tx-price">{formatPrice(tx.price)}</span>
              <span className="tx-total">{formatTotal(tx.total)}</span>
              <span className="tx-time">{tx.timestamp}</span>
              <span className="tx-user">anon</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
