'use client';

import { useState, useEffect } from 'react';
import WalletSelector from './WalletSelector';
import { walletManager, WalletInfo } from '../../../lib/walletManager';

export default function ConnectButton({ className, onConnected }: { className?: string; onConnected?: (wallet: WalletInfo) => void }) {
  const [connectedWallet, setConnectedWallet] = useState<WalletInfo | null>(null);

  useEffect(() => {
    // Check for existing connections on mount
    const wallets = walletManager.getConnectedWallets();
    if (wallets.length > 0) {
      setConnectedWallet(wallets[0]);
    }
  }, []);

  const handleWalletSelect = async (walletId: string) => {
    try {
      console.log(`Attempting to connect ${walletId} wallet...`);
      const result = await walletManager.connectWallet(walletId);
      if (result.success && result.wallet) {
        console.log(`Successfully connected ${walletId} wallet:`, result.wallet);
        setConnectedWallet(result.wallet);
        onConnected?.(result.wallet);
        // Persist wallet connection
        localStorage.setItem('siphon-connected-wallet', JSON.stringify(result.wallet));
      } else {
        console.error(`Failed to connect ${walletId} wallet:`, result.error);
        // Show wallet-specific error message
        const walletName = walletId === 'phantom' ? 'Phantom' : 
                          walletId === 'solflare' ? 'Solflare' : 
                          walletId === 'metamask' ? 'MetaMask' : walletId;
        alert(`${walletName} connection failed: ${result.error}`);
      }
    } catch (error: unknown) {
      console.error(`Connection error for ${walletId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Connection error: ${errorMessage}`);
    }
  };

  const handleDisconnect = () => {
    if (connectedWallet) {
      console.log(`Disconnecting ${connectedWallet.id} wallet...`);
      walletManager.disconnectWallet(connectedWallet.id);
      setConnectedWallet(null);
      // Clear persisted wallet connection
      localStorage.removeItem('siphon-connected-wallet');
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletLogo = (walletId: string) => {
    switch (walletId) {
      case 'phantom':
        return (
          <svg width="20" height="20" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M102.7 21.2C91.4 8.5 75.8 0 58.1 0 26 0 0 25.9 0 57.9c0 14.3 5.2 27.4 13.8 37.5 4.8-7.8 13.2-13 22.7-13h.1c6.1 0 11 4.9 11 11s-4.9 11-11 11h-.1c-3 0-5.8-1.2-7.9-3.2-2.5 2.6-5.3 4.8-8.4 6.5 4 4.1 9.5 6.7 15.7 6.7h.1c13.3 0 24.1-10.8 24.1-24.1 0-7.2-3.2-13.7-8.2-18.2 1.1-2.2 1.7-4.7 1.7-7.3 0-9.1-7.4-16.5-16.5-16.5-9.1 0-16.5 7.4-16.5 16.5 0 3.3.9 6.3 2.6 8.9-5.9 4.2-9.8 11.1-9.8 18.9 0 12.8 10.4 23.1 23.1 23.1h.1c14.2 0 25.7-11.5 25.7-25.7 0-10.2-5.9-19-14.5-23.2 8.7-4.5 14.7-13.6 14.7-24.1 0-14.9-12.1-27-27-27-14.9 0-27 12.1-27 27 0 4 .9 7.8 2.4 11.2-8.9 5.9-14.8 15.9-14.8 27.3C0 91.2 26 117.1 58.1 117.1c32.1 0 58.1-25.9 58.1-57.9 0-16.3-6.7-31-17.5-41.6l4-4.4z" fill="url(#phantom-gradient)"/>
            <defs>
              <linearGradient id="phantom-gradient" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
                <stop stopColor="#534BB1"/>
                <stop offset="1" stopColor="#551BF9"/>
              </linearGradient>
            </defs>
          </svg>
        );
      case 'solflare':
        return (
          <svg width="20" height="20" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40.7 165.2C43.8 162.1 48.1 160.3 52.6 160.3H234.6C242.7 160.3 246.9 169.8 241.4 175.3L199.3 217.4C196.2 220.5 191.9 222.3 187.4 222.3H5.4C-2.7 222.3 -6.9 212.8 -1.4 207.3L40.7 165.2Z" fill="url(#solflare-gradient1)"/>
            <path d="M40.7 5.7C43.9 2.6 48.2 0.8 52.7 0.8H234.7C242.8 0.8 247 10.3 241.5 15.8L199.4 57.9C196.3 61 192 62.8 187.5 62.8H5.5C-2.6 62.8 -6.8 53.3 -1.3 47.8L40.7 5.7Z" fill="url(#solflare-gradient2)"/>
            <path d="M199.3 84.4C196.1 81.3 191.8 79.5 187.3 79.5H5.3C-2.8 79.5 -7 89 -1.5 94.5L40.6 136.6C43.7 139.7 48 141.5 52.5 141.5H234.5C242.6 141.5 246.8 132 241.3 126.5L199.3 84.4Z" fill="url(#solflare-gradient3)"/>
            <defs>
              <linearGradient id="solflare-gradient1"><stop stopColor="#FC7C14"/><stop offset="1" stopColor="#FCA814"/></linearGradient>
              <linearGradient id="solflare-gradient2"><stop stopColor="#FC7C14"/><stop offset="1" stopColor="#FCA814"/></linearGradient>
              <linearGradient id="solflare-gradient3"><stop stopColor="#FC7C14"/><stop offset="1" stopColor="#FCA814"/></linearGradient>
            </defs>
          </svg>
        );
      case 'metamask':
        return (
          <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M35.5 3L21.3 13.5L23.9 7.2L35.5 3Z" fill="#E17726"/>
            <path d="M4.4 3L18.4 13.6L16.1 7.2L4.4 3Z" fill="#E27625"/>
            <path d="M30.3 28L26.8 33.7L34.7 35.9L37 28.1L30.3 28Z" fill="#E27625"/>
            <path d="M3 28.1L5.3 35.9L13.2 33.7L9.7 28L3 28.1Z" fill="#E27625"/>
          </svg>
        );
      case 'solana':
        return (
          <svg width="20" height="20" viewBox="0 0 397 311" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="url(#gradient1)"/>
            <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="url(#gradient2)"/>
            <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="url(#gradient3)"/>
            <defs>
              <linearGradient id="gradient1"><stop stopColor="#00FFA3"/><stop offset="1" stopColor="#DC1FFF"/></linearGradient>
              <linearGradient id="gradient2"><stop stopColor="#00FFA3"/><stop offset="1" stopColor="#DC1FFF"/></linearGradient>
              <linearGradient id="gradient3"><stop stopColor="#00FFA3"/><stop offset="1" stopColor="#DC1FFF"/></linearGradient>
            </defs>
          </svg>
        );
      default:
        return <span className="wallet-icon-text">{walletId.substring(0, 2).toUpperCase()}</span>;
    }
  };

  if (connectedWallet) {
    return (
      <button 
        className={`connected-wallet-button ${className}`}
        onClick={handleDisconnect}
        title="Click to disconnect"
      >
        <div className="wallet-info">
          <div className="wallet-icon-wrapper">
            {getWalletLogo(connectedWallet.id)}
          </div>
          <div className="wallet-details">
            <span className="wallet-address">{formatAddress(connectedWallet.address)}</span>
            <span className="disconnect-text">Disconnect</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <WalletSelector 
      className={className}
      onWalletSelect={handleWalletSelect}
    />
  );
}
