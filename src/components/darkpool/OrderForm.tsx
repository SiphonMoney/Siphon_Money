// OrderForm.tsx - Form for placing orders
"use client";

import { useState } from 'react';
import { BACKEND_URL } from '@/lib/constants';
import { getOrCreateUserKeys, encryptOrderData } from '@/lib/encryption';
import './darkpool.css';

interface OrderFormProps {
  walletAddress: string;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  onSuccess?: (orderId: string) => void;
}

type OrderType = 'buy' | 'sell';

export default function OrderForm({ 
  walletAddress, 
  signMessage,
  onSuccess 
}: OrderFormProps) {
  const [orderType, setOrderType] = useState<OrderType>('buy');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitOrder = async () => {
    if (!price || !amount) {
      setError('Please enter both price and amount');
      return;
    }

    if (parseFloat(price) <= 0 || parseFloat(amount) <= 0) {
      setError('Price and amount must be positive');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get user's x25519 keys
      const { privateKey, publicKey: encPubkey } = await getOrCreateUserKeys(
        walletAddress,
        signMessage
      );
      
      // TODO: Get MXE public key from chain
      const mockMxePubkey = new Uint8Array(32);
      
      // Encrypt order data
      const { encrypted, nonce } = await encryptOrderData(
        {
          orderType: orderType === 'buy' ? 0 : 1,
          amount: parseFloat(amount) * 1e9,
          price: parseFloat(price) * 1e6,
        },
        privateKey,
        mockMxePubkey
      );
      
      // Send to backend
      const response = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: walletAddress,
          userEncPubkey: Array.from(encPubkey),
          encryptedOrder: encrypted,
          nonce: nonce.toString(),
          orderType: orderType,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      const data = await response.json();
      console.log('Order submitted:', data.orderId);
      
      // Clear form
      setPrice('');
      setAmount('');
      
      onSuccess?.(data.orderId);
    } catch (err) {
      console.error('Order submission failed:', err);
      setError(err instanceof Error ? err.message : 'Order submission failed');
    } finally {
      setLoading(false);
    }
  };

  const totalValue = price && amount 
    ? (parseFloat(price) * parseFloat(amount)).toFixed(2)
    : '0.00';

  return (
    <div className="order-form">
      <h3>Place Order</h3>

      <div className="order-type-selector">
        <button
          className={`order-type-btn ${orderType === 'buy' ? 'active buy' : ''}`}
          onClick={() => setOrderType('buy')}
          disabled={loading}
        >
          Buy
        </button>
        <button
          className={`order-type-btn ${orderType === 'sell' ? 'active sell' : ''}`}
          onClick={() => setOrderType('sell')}
          disabled={loading}
        >
          Sell
        </button>
      </div>

      <div className="form-group">
        <label>Price (USDC per SOL)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="105.00"
          disabled={loading}
          min="0"
          step="0.01"
        />
      </div>

      <div className="form-group">
        <label>Amount (SOL)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="10.0"
          disabled={loading}
          min="0"
          step="0.0001"
        />
      </div>

      <div className="form-group">
        <label>Total (USDC)</label>
        <input
          type="text"
          value={totalValue}
          readOnly
          disabled
          className="readonly-input"
        />
      </div>

      <div className="info-box">
        <span>Your order details are encrypted end-to-end. Only MPC can see them for matching.</span>
      </div>

      {error && (
        <div className="error-box">
          <span>{error}</span>
        </div>
      )}

      <button 
        onClick={submitOrder}
        disabled={loading || !price || !amount}
        className={`submit-order-btn ${orderType}`}
      >
        {loading ? (
          <span className="loading-content">
            <span className="spinner-small"></span>
            Submitting...
          </span>
        ) : (
          `Place ${orderType.toUpperCase()} Order`
        )}
      </button>
    </div>
  );
}

