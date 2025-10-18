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
  user: string;
}

interface TransactionListProps {
  poolPair: string;
}

export default function TransactionList({ poolPair }: TransactionListProps) {
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
        user: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`
      });
    }
    
    return mockTransactions;
  }, [poolPair]);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setTransactions(generateMockTransactions());
      setIsLoading(false);
    }, 300);
  }, [poolPair, generateMockTransactions]);

  const filteredTransactions = transactions.filter(tx => 
    filter === 'all' || tx.type === filter
  );

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
          <span>User</span>
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
              <span className="tx-user">{tx.user}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="list-footer">
        <button className="load-more-btn">Load More Transactions</button>
      </div>
    </div>
  );
}
