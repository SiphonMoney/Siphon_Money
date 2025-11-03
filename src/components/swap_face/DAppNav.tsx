"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ConnectButton from "./extensions/ConnectButton";
import { WalletInfo } from "../../lib/walletManager";
import "./SwapInterface.css";

interface DAppNavProps {
  onWalletConnected?: (wallet: WalletInfo) => void;
}

export default function DAppNav({ onWalletConnected }: DAppNavProps) {
  const pathname = usePathname();
  const isDarkPool = pathname === "/dapp/darkpool";
  const isPro = pathname === "/dapp/pro";
  const isSwaps = pathname === "/dapp/swaps";

  return (
    <>
      {/* Mode Toggle */}
      <div className="floating-mode-toggle">
        <Link href="/dapp/darkpool">
          <button className={`toggle-button ${isDarkPool ? 'active' : ''}`}>
            Dark Pools
          </button>
        </Link>
        <Link href="/dapp/swaps">
          <button className={`toggle-button ${isSwaps ? 'active-limited' : ''}`}>
            Swaps
          </button>
        </Link>
        <Link href="/dapp/pro">
          <button className={`toggle-button ${isPro ? 'active-limited' : ''}`}>
            Pro
          </button>
        </Link>
      </div>

      {/* Wallet Connector */}
      <div className="top-right-wallet-connector">
        <ConnectButton 
          className="top-connect-button"
          onConnected={onWalletConnected}
        />
      </div>
    </>
  );
}

