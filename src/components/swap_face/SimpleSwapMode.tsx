"use client";

import { useState } from "react";
import "./SimpleSwapMode.css";
import ConnectButton from "./extensions/ConnectButton";
import TokenSelector from "./extensions/TokenSelector";
import ToTokenSelector from "./extensions/ToTokenSelector";
import { WalletInfo } from "../../lib/walletManager";

interface SimpleSwapModeProps {
  isLoaded: boolean;
  walletConnected: boolean;
  onWalletConnected: (wallet: WalletInfo) => void;
}

export default function SimpleSwapMode({
  isLoaded,
  walletConnected,
  onWalletConnected
}: SimpleSwapModeProps) {
  const [swapFromToken, setSwapFromToken] = useState("ZEC-Zcash");
  const [swapToToken, setSwapToToken] = useState("SOL-Solana");
  const [swapAmount, setSwapAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const handleSwap = async () => {
    console.log('handleSwap called');
    console.log('Current state:', { swapAmount, swapFromToken });
    
    if (!walletConnected) {
      alert('Please connect wallet first');
      return;
    }

    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!swapFromToken) {
      alert('Please select a token');
      return;
    }

    if (!withdrawAddress) {
      alert('Please enter a withdrawal address');
      return;
    }

    setIsTransferring(true);

    try {
      // Mock transfer - replace with actual implementation
      console.log('Mock transfer:', { swapAmount, swapFromToken, withdrawAddress });
      
      // Simulate transfer delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Transfer completed successfully!');
      
      // Reset form
      setSwapAmount("");
      setWithdrawAddress("");
      
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Transfer failed. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };

  // Keep predefined tokens (Zcash first, SOL second) regardless of wallet connection

  return (
    <div className={`simple-swap ${isLoaded ? 'loaded' : ''}`}>
      <h3>Swap Tokens</h3>
      
      <ConnectButton 
        className="connect-button" 
        onConnected={async (wallet) => {
          onWalletConnected(wallet);
        }}
      />

      <div className="swap-inputs">
        <div className="input-group">
          <input
            type="number"
            placeholder="0.0"
            value={swapAmount}
            onChange={(e) => setSwapAmount(e.target.value)}
          />
          <div className="token-selector">
            <TokenSelector
              balances={null}
              selectedToken={swapFromToken}
              onTokenSelect={setSwapFromToken}
              className="token-select"
            />
          </div>
        </div>

        <div className="swap-arrow">↓</div>

        <div className="input-group">
          <input
            type="number"
            placeholder="0.0"
            readOnly
          />
          <div className="token-selector">
            <ToTokenSelector
              selectedToken={swapToToken}
              onTokenSelect={setSwapToToken}
              className="token-select"
            />
          </div>
        </div>

        <br />

        <div className="wallet-input">
          <label>Withdraw to</label>
          <input
            type="text"
            placeholder="Enter wallet address"
            value={withdrawAddress}
            onChange={(e) => setWithdrawAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="swap-info">
        <div className="info-row">
          <span>Rate</span>
          <span>1 SOL = 150 USDC</span>
        </div>
        <div className="info-row">
          <span>Slippage</span>
          <span>0.5%</span>
        </div>
        <div className="info-row">
          <span>Fee</span>
          <span>0.3%</span>
        </div>
      </div>

      <div className="privacy-info">
        <span className="privacy-text">
          🔒 Privacy: Standard swap with basic anonymity
        </span>
        <div className="privacy-tooltip">
          Standard swap uses public pools with basic privacy. For maximum anonymity, use Pro mode with Siphon Protocol&apos;s advanced privacy features.
        </div>
      </div>

      <button 
        className="action-button" 
        onClick={handleSwap}
        disabled={!walletConnected || isTransferring}
      >
        {isTransferring ? (
          <span className="loading-content">
            <span className="spinner"></span>
            Transferring...
          </span>
        ) : (
          walletConnected ? 'Transfer to Address' : 'Connect Wallet First'
        )}
      </button>
    </div>
  );
}
