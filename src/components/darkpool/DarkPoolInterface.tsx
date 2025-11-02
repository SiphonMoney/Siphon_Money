// DarkPoolInterface.tsx - Main interface for dark pool trading
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useUserLedger } from '@/hooks/useUserLedger';
import InitializeLedger from './InitializeLedger';
import BalanceDisplay from './BalanceDisplay';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';
import OrderForm from './OrderForm';
import OrderList from './OrderList';
import './darkpool.css';

interface DarkPoolInterfaceProps {
  walletAddress: string | null;
  walletName?: string;
  onDisconnect?: () => void;
}

type View = 'overview' | 'trade' | 'history';
type ModalType = 'deposit' | 'withdraw' | null;

export default function DarkPoolInterface({ 
  walletAddress,
  walletName = 'Wallet',
  onDisconnect 
}: DarkPoolInterfaceProps) {
  const { exists: ledgerExists, loading: checkingLedger, checkLedgerExists } = useUserLedger(walletAddress);
  const [view, setView] = useState<View>('overview');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [balanceKey, setBalanceKey] = useState(0);

  // Mock signMessage function - replace with actual wallet adapter
  const signMessage = useCallback(async (message: Uint8Array): Promise<Uint8Array> => {
    // TODO: Implement actual message signing with wallet adapter
    console.log('Signing message:', message);
    return new Uint8Array(64).fill(0); // Mock signature
  }, []);

  const handleLedgerInitialized = () => {
    checkLedgerExists();
  };

  const handleDepositSuccess = () => {
    setActiveModal(null);
    setBalanceKey(prev => prev + 1); // Force balance refresh
  };

  const handleWithdrawSuccess = () => {
    setActiveModal(null);
    setBalanceKey(prev => prev + 1); // Force balance refresh
  };

  const handleOrderSuccess = (orderId: string) => {
    console.log('Order placed successfully:', orderId);
    setBalanceKey(prev => prev + 1); // Force balance refresh
  };

  // Not connected state - MUST connect wallet first
  if (!walletAddress) {
    return (
      <div className="darkpool-interface">
        <div className="welcome-screen">
          <div className="wallet-icon-large">🔐</div>
          <h1>Connect Your Wallet</h1>
          <p className="subtitle">You need to connect your wallet to access the Dark Pool</p>
          
          <div className="connect-steps">
            <div className="step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h4>Connect Wallet</h4>
                <p>Click "Connect Wallet" in the top navigation</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h4>Initialize Account</h4>
                <p>Set up your encrypted balance tracker</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h4>Start Trading</h4>
                <p>Deposit funds and place private orders</p>
              </div>
            </div>
          </div>

          <div className="connect-prompt-large">
            <div className="prompt-icon">⬆️</div>
            <p className="prompt-text">
              <strong>Please connect your wallet using the button above</strong>
            </p>
            <p className="prompt-subtext">
              We support Phantom, Solflare, and other Solana wallets
            </p>
          </div>

          <div className="features-preview">
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span className="feature-text">Encrypted Balances</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🤐</span>
              <span className="feature-text">Private Trading</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span className="feature-text">Fast Settlement</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Checking ledger state
  if (checkingLedger) {
    return (
      <div className="darkpool-interface">
        <div className="loading-screen">
          <div className="spinner-large"></div>
          <p>Checking account status...</p>
        </div>
      </div>
    );
  }

  // Need to initialize ledger
  if (!ledgerExists) {
    return (
      <div className="darkpool-interface">
        <InitializeLedger
          walletAddress={walletAddress}
          onComplete={handleLedgerInitialized}
        />
      </div>
    );
  }

  // Main interface
  return (
    <div className="darkpool-interface">
      {/* Header */}
      <div className="darkpool-main-header">
        <div className="header-left">
          <h2>🌑 Dark Pool</h2>
        </div>
        <div className="header-right">
          <div className="wallet-badge">
            <span className="wallet-name">{walletName}</span>
            <span className="wallet-address">
              {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
            </span>
          </div>
          {onDisconnect && (
            <button onClick={onDisconnect} className="disconnect-btn">
              Disconnect
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="view-tabs">
        <button 
          className={`tab ${view === 'overview' ? 'active' : ''}`}
          onClick={() => setView('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${view === 'trade' ? 'active' : ''}`}
          onClick={() => setView('trade')}
        >
          Trade
        </button>
        <button 
          className={`tab ${view === 'history' ? 'active' : ''}`}
          onClick={() => setView('history')}
        >
          Order History
        </button>
      </div>

      {/* Content Area */}
      <div className="content-area">
        {view === 'overview' && (
          <div className="overview-view">
            <div className="balance-section">
              <BalanceDisplay
                key={balanceKey}
                walletAddress={walletAddress}
                signMessage={signMessage}
              />
            </div>

            <div className="actions-section">
              <h3>Manage Funds</h3>
              <div className="action-buttons">
                <button 
                  onClick={() => setActiveModal('deposit')}
                  className="action-card deposit"
                >
                  <span className="icon">💰</span>
                  <div className="action-content">
                    <h4>Deposit</h4>
                    <p>Add tokens to your encrypted balance</p>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveModal('withdraw')}
                  className="action-card withdraw"
                >
                  <span className="icon">🏦</span>
                  <div className="action-content">
                    <h4>Withdraw</h4>
                    <p>Remove tokens from the pool</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="info-section">
              <div className="info-card">
                <span className="icon">🔒</span>
                <div>
                  <h4>Privacy First</h4>
                  <p>Your balances are encrypted on-chain using MPC</p>
                </div>
              </div>
              <div className="info-card">
                <span className="icon">⚡</span>
                <div>
                  <h4>Fast Settlement</h4>
                  <p>Orders settle within seconds using Solana</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'trade' && (
          <div className="trade-view">
            <div className="trade-container">
              <div className="order-form-container">
                <OrderForm
                  walletAddress={walletAddress}
                  signMessage={signMessage}
                  onSuccess={handleOrderSuccess}
                />
              </div>
              <div className="market-info">
                <div className="market-card">
                  <h4>SOL/USDC Market</h4>
                  <div className="market-stats">
                    <div className="stat">
                      <span className="label">Current Price</span>
                      <span className="value">$192.00</span>
                    </div>
                    <div className="stat">
                      <span className="label">24h Change</span>
                      <span className="value positive">+2.3%</span>
                    </div>
                    <div className="stat">
                      <span className="label">24h Volume</span>
                      <span className="value">$1.2M</span>
                    </div>
                  </div>
                </div>
                <div className="info-box">
                  <span className="icon">ℹ️</span>
                  <div>
                    <strong>How it works:</strong>
                    <ol>
                      <li>Your order is encrypted and submitted</li>
                      <li>MPC matches orders privately</li>
                      <li>Settlement happens on-chain</li>
                      <li>Your balance updates automatically</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="history-view">
            <OrderList walletAddress={walletAddress} />
          </div>
        )}
      </div>

      {/* Modals */}
      {activeModal === 'deposit' && (
        <DepositModal
          walletAddress={walletAddress}
          onClose={() => setActiveModal(null)}
          onSuccess={handleDepositSuccess}
        />
      )}

      {activeModal === 'withdraw' && (
        <WithdrawModal
          walletAddress={walletAddress}
          onClose={() => setActiveModal(null)}
          onSuccess={handleWithdrawSuccess}
        />
      )}
    </div>
  );
}

