"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/theme/Nav";
import DAppNav from "@/components/swap_face/DAppNav";
import SimpleSwapMode from "@/components/swap_face/SimpleSwapMode";
import { WalletInfo } from "@/lib/walletManager";
import styles from "../../hero.module.css";

export default function SwapsPage() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [, setConnectedWallet] = useState<WalletInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleWalletConnected = (wallet: WalletInfo) => {
    console.log('Wallet connected:', wallet);
    setWalletConnected(true);
    setConnectedWallet(wallet);
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
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000',
      position: 'relative'
    }}>
      <Nav />
      <DAppNav onWalletConnected={handleWalletConnected} />
      
      {/* Hero text, logo and subtitle - behind everything */}
      <div className={styles.heroContainer} style={{ zIndex: 1 }}>
        {/* SVG Logo */}
        <svg 
          className={styles.logo}
          viewBox="0 0 97.34 80" 
        >
          <path 
            d="M70.66,35.93a11.66,11.66,0,0,1,1,.83c1.84,1.89,3.69,3.78,5.5,5.7,2.24,2.35,2.14,1.66-.06,3.9-4.47,4.53-9,9-13.49,13.49-1,1-1,1.09-.16,1.95q7.47,7.5,15,15c.85.85,1,.85,1.83,0q7.5-7.47,15-15c.84-.85.83-1,0-1.84-1.58-1.61-3.2-3.2-4.8-4.8l-9.72-9.73c-1.05-1-1-1.07,0-2.14.07-.08.15-.15.23-.23L92.22,32c1.5-1.47,3-2.94,4.49-4.43.86-.87.84-.9,0-1.81-.14-.16-.3-.3-.46-.46L81.59,10.63Q76.67,5.71,71.75.8c-1.07-1.07-1.09-1.07-2.17,0L64.82,5.66,37.45,33.19q-5.19,5.22-10.38,10.43c-.88.88-.9.87-1.77,0S23.83,42,23.08,41.26c-1.46-1.5-2.95-3-4.41-4.5-1.05-1.1-1-1.11,0-2.16l.23-.23Q25.94,27.28,33,20.19c1.08-1.08,1.09-1.08,0-2.16q-4.27-4.31-8.56-8.59c-2.06-2.06-4.11-4.13-6.18-6.17-.94-.93-1-.91-1.95,0-.2.18-.39.37-.58.56q-6.52,6.53-13,13c-.46.46-.92.91-1.36,1.38-.74.81-.73.88,0,1.73.18.2.37.38.56.57l8.81,8.81c1.83,1.83,3.64,3.67,5.49,5.49.54.52.62.95,0,1.46-.33.28-.62.61-.92.91L.85,51.75a3.65,3.65,0,0,0-.76.82,1.43,1.43,0,0,0,0,1c.1.28.42.48.64.71q12,12.45,24.05,24.89c1.1,1.14,1.11,1.14,2.28,0l29.48-29.3,13.2-13.1C70,36.47,70.3,36.24,70.66,35.93Z" 
            fill="#ffffff" 
          />
        </svg>
        
        {/* Hero text container */}
        <div className={styles.heroTextContainer}>
          {/* Main title */}
          <h1 className={styles.heroTitle}>
            siphon
          </h1>
          
          {/* Subtitle */}
          <p className={styles.heroSubtitle}>
            trade without a trace
          </p>
        </div>
      </div>
      
      {/* Semi-transparent overlay - between logo and DApp */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      />
      
      {/* DApp Interface - on top of everything */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{
          width: '95vw',
          height: '85vh',
          maxWidth: '1200px',
          pointerEvents: 'auto',
          position: 'relative'
        }}>
          {/* Blurred content */}
          <div style={{
            filter: 'blur(3px)',
            pointerEvents: 'none',
            width: '100%',
            height: '100%'
          }}>
            <SimpleSwapMode
              isLoaded={isLoaded}
              walletConnected={walletConnected}
              onWalletConnected={handleWalletConnected}
            />
          </div>
          
          {/* Development Notice Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '3rem 2.5rem',
              maxWidth: '480px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                🔒
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '1rem',
                color: 'rgba(255, 255, 255, 0.9)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontFamily: 'var(--font-source-code), monospace'
              }}>
                Not Public Yet
              </h3>
              <div style={{
                width: '48px',
                height: '1px',
                background: 'rgba(255, 255, 255, 0.1)',
                margin: '0 auto 1.5rem'
              }} />
              <p style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.6',
                fontFamily: 'var(--font-source-code), monospace',
                letterSpacing: '0.3px',
                marginBottom: '1.5rem'
              }}>
Not publicly available at this moment, this function is still under development and has limited access.              </p>
              <p style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: '1.5',
                fontFamily: 'var(--font-source-code), monospace',
                letterSpacing: '0.3px',
                margin: 0
              }}>
                Join our Discord to request access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

