"use client";

import { useState, useEffect } from "react";
import "./SwapInterface.css";
import ProSwapMode from "./ProSwapMode";
import BookOrder from "./BookOrder";
import ConnectButton from "./extensions/ConnectButton";
import { WalletInfo } from "../../lib/walletManager";

export default function SwapInterface() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mode, setMode] = useState<'pro' | 'darkpool'>('darkpool');
  
  // Wallet state
  const [walletConnected, setWalletConnected] = useState(false);
  const [_connectedWallet, setConnectedWallet] = useState<WalletInfo | null>(null);

  // Handler functions for child components
  const handleWalletConnected = (wallet: WalletInfo) => {
    setWalletConnected(true);
    setConnectedWallet(wallet);
    // Persist wallet connection
    localStorage.setItem('siphon-connected-wallet', JSON.stringify(wallet));
  };


  useEffect(() => {
    // Delay to ensure styles are loaded
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    // Check for persisted wallet connection
    const persistedWallet = localStorage.getItem('siphon-connected-wallet');
    
    if (persistedWallet) {
      try {
        const wallet = JSON.parse(persistedWallet);
        setConnectedWallet(wallet);
        setWalletConnected(true);
      } catch (error) {
        console.error('Failed to parse persisted wallet:', error);
        localStorage.removeItem('siphon-connected-wallet');
      }
    }

    return () => clearTimeout(timer);
  }, []);


  return (
    <div className="siphon-container">
      {/* Floating Mode Toggle */}
      <div className="floating-mode-toggle">
        <button 
          className={`toggle-button ${mode === 'darkpool' ? 'active' : ''}`}
          onClick={() => setMode('darkpool')}
        >
          Dark Pools
        </button>
        <button 
          className={`toggle-button ${mode === 'pro' ? 'active' : ''}`}
          onClick={() => setMode('pro')}
        >
          Pro
        </button>
      </div>

      {/* Top Right Wallet Connector */}
      <div className="top-right-wallet-connector">
        <ConnectButton 
          className="top-connect-button"
          onConnected={handleWalletConnected}
        />
      </div>

      <div className={`siphon-window ${isLoaded ? 'loaded' : ''} ${mode === 'pro' ? 'pro-mode' : 'darkpool-mode'}`}>
        {mode === 'pro' ? (
          <ProSwapMode
            isLoaded={isLoaded}
          />
        ) : (
          <BookOrder
            isLoaded={isLoaded}
            walletConnected={walletConnected}
            connectedWallet={_connectedWallet}
            onWalletConnected={handleWalletConnected}
          />
        )}
      </div>

    </div>
  );
}


