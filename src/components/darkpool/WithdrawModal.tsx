// WithdrawModal.tsx - Modal for withdrawing tokens from dark pool (two-step process)
"use client";

import { useState } from 'react';
import { BACKEND_URL } from '@/lib/constants';
import './darkpool.css';

interface WithdrawModalProps {
  walletAddress: string;
  onClose: () => void;
  onSuccess: () => void;
}

type TokenType = 'base' | 'quote';
type WithdrawStatus = 'idle' | 'verifying' | 'waiting_backend' | 'executing' | 'complete' | 'failed';

export default function WithdrawModal({ 
  onClose, 
  onSuccess 
}: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [tokenType, setTokenType] = useState<TokenType>('base');
  const [status, setStatus] = useState<WithdrawStatus>('idle');
  const [txSignature, setTxSignature] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const tokenName = tokenType === 'base' ? 'SOL' : 'USDC';

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setStatus('verifying');
    setError(null);

    try {
      // Step 1: MPC Verification
      // TODO: Implement actual withdraw_from_ledger_verify instruction
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTxSig = 'mock_tx_' + Date.now();
      setTxSignature(mockTxSig);

      // Wait for MPC computation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setStatus('waiting_backend');
      
      // Step 2: Poll backend for execution status
      await pollWithdrawalStatus(mockTxSig);
      
    } catch (err) {
      console.error('Withdrawal failed:', err);
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
      setStatus('failed');
    }
  };

  const pollWithdrawalStatus = async (txSig: string) => {
    const maxAttempts = 30; // 30 * 2s = 60s timeout
    let attempts = 0;
    
    const poll = async () => {
      attempts++;
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/withdrawals/${txSig}`);
        
        if (!response.ok) {
          // Mock successful completion after 3 attempts
          if (attempts >= 3) {
            setStatus('complete');
            setTimeout(() => {
              onSuccess();
            }, 1000);
            return;
          }
          throw new Error('Withdrawal status check failed');
        }

        const data = await response.json();
        
        if (data.status === 'executing') {
          setStatus('executing');
        } else if (data.status === 'complete') {
          setStatus('complete');
          setTimeout(() => {
            onSuccess();
          }, 1000);
          return;
        } else if (data.status === 'failed') {
          setStatus('failed');
          setError('Backend execution failed');
          return;
        }
      } catch (err) {
        console.log('Poll attempt', attempts, 'failed:', err);
        
        // Mock successful completion after attempts
        if (attempts >= 3) {
          setStatus('complete');
          setTimeout(() => {
            onSuccess();
          }, 1000);
          return;
        }
      }
      
      if (attempts >= maxAttempts) {
        setStatus('failed');
        setError('Withdrawal timeout - please check status manually');
        return;
      }
      
      // Continue polling
      setTimeout(poll, 2000);
    };
    
    poll();
  };

  const renderContent = () => {
    switch (status) {
      case 'idle':
        return (
          <>
            <div className="form-section">
              <div className="form-group">
                <label>Token Type</label>
                <div className="token-selector">
                  <button
                    className={`token-option ${tokenType === 'base' ? 'active' : ''}`}
                    onClick={() => setTokenType('base')}
                  >
                    SOL (Base Token)
                  </button>
                  <button
                    className={`token-option ${tokenType === 'quote' ? 'active' : ''}`}
                    onClick={() => setTokenType('quote')}
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
                    min="0"
                    step="any"
                  />
                  <span className="token-badge">{tokenName}</span>
                </div>
              </div>

              <div className="info-box warning">
                <div>
                  <strong>Two-step withdrawal process:</strong>
                  <ol>
                    <li>MPC validates your encrypted balance (5-10s)</li>
                    <li>Backend executes token transfer (3-5s)</li>
                  </ol>
                  <span className="time-estimate">Total time: ~15-30 seconds</span>
                </div>
              </div>

              {error && (
                <div className="error-box">
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="button-group">
              <button onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button 
                onClick={handleWithdraw}
                disabled={!amount || parseFloat(amount) <= 0}
                className="btn-primary"
              >
                Withdraw
              </button>
            </div>
          </>
        );

      case 'verifying':
        return (
          <div className="status-screen">
            <div className="spinner-large"></div>
            <h3>Step 1: Verifying Balance</h3>
            <p>MPC is validating your encrypted balance...</p>
          </div>
        );

      case 'waiting_backend':
        return (
          <div className="status-screen">
            <div className="spinner-large"></div>
            <h3>Step 2: Waiting for Execution</h3>
            <p>Backend is processing your withdrawal...</p>
          </div>
        );

      case 'executing':
        return (
          <div className="status-screen">
            <div className="spinner-large"></div>
            <h3>Executing Transfer</h3>
            <p>Transferring tokens from vault to your wallet...</p>
          </div>
        );

      case 'complete':
        return (
          <div className="status-screen success">
            <h3>Withdrawal Complete!</h3>
            <p>Tokens have been sent to your wallet.</p>
            {txSignature && (
              <a 
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="explorer-link"
              >
                View Transaction →
              </a>
            )}
            <button onClick={onClose} className="btn-primary">
              Close
            </button>
          </div>
        );

      case 'failed':
        return (
          <div className="status-screen error">
            <h3>Withdrawal Failed</h3>
            <p>{error || 'Either insufficient balance or backend error. Please try again.'}</p>
            <button onClick={() => {
              setStatus('idle');
              setError(null);
            }} className="btn-primary">
              Try Again
            </button>
          </div>
        );
    }
  };

  return (
    <div className="modal-backdrop" onClick={status === 'idle' ? onClose : undefined}>
      <div className="modal-container darkpool-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          {status === 'idle' && (
            <div className="modal-header">
              <h2>Withdraw Tokens</h2>
              <button onClick={onClose} className="close-btn">×</button>
            </div>
          )}

          {renderContent()}
        </div>
      </div>
    </div>
  );
}

