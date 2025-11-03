// InitializeLedger.tsx - Component for initializing user's private ledger
"use client";

import { useState } from 'react';
import './darkpool.css';

interface InitializeLedgerProps {
  walletAddress: string;
  onComplete: () => void;
  onCancel?: () => void;
}

export default function InitializeLedger({ walletAddress, onComplete, onCancel }: InitializeLedgerProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  const initializeLedger = async () => {
    setIsInitializing(true);
    setError(null);
    setProgress('Preparing initialization...');

    try {
      // TODO: Implement actual initialization logic
      // 1. Generate user's x25519 keys
      // 2. Generate nonce and computation offset
      // 3. Call initialize_user_ledger instruction
      // 4. Wait for MPC computation finalization
      
      setProgress('Generating encryption keys...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProgress('Creating on-chain account...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setProgress('Finalizing MPC computation...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('User ledger initialized for:', walletAddress);
      
      setProgress('Complete!');
      setTimeout(onComplete, 500);
    } catch (err) {
      console.error('Initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Initialization failed');
      setIsInitializing(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container darkpool-modal">
        <div className="modal-content">
          <h2>Initialize Your Private Ledger</h2>
          
          <div className="info-section">
            <p>
              Before you can add liquidity or trade, you need to initialize
              your encrypted balance tracker.
            </p>
            <p>
              This is a one-time setup that creates your private
              ledger using MPC encryption.
            </p>
            <div className="info-box">
              <span>Your balances will be encrypted on-chain</span>
            </div>
            <div className="info-box">
              <span>Takes approximately 5-10 seconds</span>
            </div>
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

          <div className="button-group">
            {onCancel && !isInitializing && (
              <button 
                onClick={onCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
            <button 
              onClick={initializeLedger}
              disabled={isInitializing}
              className="btn-primary"
            >
              {isInitializing ? 'Initializing...' : 'Initialize Ledger'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

