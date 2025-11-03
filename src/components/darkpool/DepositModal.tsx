// DepositModal.tsx - Modal for depositing tokens to dark pool
"use client";

import { useState } from 'react';
import './darkpool.css';

interface DepositModalProps {
  walletAddress: string;
  onClose: () => void;
  onSuccess: () => void;
}

type TokenType = 'base' | 'quote';

export default function DepositModal({ 
  walletAddress, 
  onClose, 
  onSuccess 
}: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [tokenType, setTokenType] = useState<TokenType>('base');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  const tokenName = tokenType === 'base' ? 'SOL' : 'USDC';

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress('Preparing deposit...');

    try {
      // TODO: Implement actual deposit logic
      // 1. Get user's x25519 public key
      // 2. Generate computation offset
      // 3. Call deposit_to_ledger instruction
      // 4. Wait for MPC computation
      
      setProgress('Getting encryption keys...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setProgress('Creating transaction...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProgress('Submitting to pool...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setProgress('Awaiting MPC computation...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Deposit completed:', { amount, tokenType, walletAddress });
      
      setProgress('Complete!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
    } catch (err) {
      console.error('Deposit failed:', err);
      setError(err instanceof Error ? err.message : 'Deposit failed');
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container darkpool-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Deposit Tokens</h2>
            <button onClick={onClose} className="close-btn">×</button>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label>Token Type</label>
              <div className="token-selector">
                <button
                  className={`token-option ${tokenType === 'base' ? 'active' : ''}`}
                  onClick={() => setTokenType('base')}
                  disabled={loading}
                >
                  SOL (Base Token)
                </button>
                <button
                  className={`token-option ${tokenType === 'quote' ? 'active' : ''}`}
                  onClick={() => setTokenType('quote')}
                  disabled={loading}
                >
                  USDC (Quote Token)
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Amount</label>
              <div className="input-with-token">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={loading}
                  min="0"
                  step="any"
                />
                <span className="token-badge">{tokenName}</span>
              </div>
            </div>

            <div className="info-box">
              <span>
                This will transfer tokens from your wallet to the pool vault
                and update your encrypted balance via MPC computation.
              </span>
            </div>

            {error && (
              <div className="error-box">
                <span>{error}</span>
              </div>
            )}

            {progress && (
              <div className="progress-box">
                <div className="spinner-small"></div>
                <span>{progress}</span>
              </div>
            )}
          </div>

          <div className="button-group">
            <button 
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={handleDeposit}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="btn-primary"
            >
              {loading ? 'Processing...' : 'Deposit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

