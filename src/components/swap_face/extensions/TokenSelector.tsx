'use client';

import { useState } from 'react';

interface TokenSelectorProps {
  balances: Array<{
    symbol: string;
    balance: string;
    balanceInFiat?: number;
    breakdown?: Array<{
      balance: string;
      balanceInFiat?: number;
      chain: {
        id: number;
        logo: string;
        name: string;
      };
      contractAddress?: `0x${string}`;
      decimals?: number;
      isNative?: boolean;
    }>;
    decimals?: number;
    icon?: string;
  }> | null;
  selectedToken: string;
  onTokenSelect: (token: string) => void;
  className?: string;
}

export default function TokenSelector({ balances, selectedToken, onTokenSelect, className }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Always show token options, even without wallet connected
  const getPredefinedTokens = () => {
    const predefinedTokens = [
      { value: "ZEC-Zcash", label: "ZEC on Zcash", symbol: "ZEC", shortName: "Z", isActive: !balances },
      { value: "SOL-Solana", label: "SOL on Solana", symbol: "SOL", shortName: "S", isActive: !balances },
      { value: "BTC-Bitcoin", label: "BTC on Bitcoin", symbol: "BTC", shortName: "B", isActive: false },
      { value: "XMR-Monero", label: "XMR on Monero", symbol: "XMR", shortName: "M", isActive: false },
      { value: "SOL-Solflare", label: "SOL on Solflare", symbol: "SOL", shortName: "SF", isActive: !!balances }
    ];
    
    return predefinedTokens;
  };

  const tokenOptions = getPredefinedTokens();

  // Find the selected option to show display text
  const selectedOption = tokenOptions.find(option => option.value === selectedToken);
  const displayText = selectedOption ? (
    <span>
      {selectedOption.symbol} <span className="chain-short">{selectedOption.shortName}</span>
    </span>
  ) : 'Select Token & Chain';

  return (
    <div className="token-selector-custom">
      <button 
        className={`token-selector-button ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {displayText}
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="token-dropdown">
          {tokenOptions.map((option) => (
            <button
              key={option.value}
              className={`token-option ${option.isActive ? 'active' : 'inactive'}`}
              onClick={() => {
                if (option.isActive) {
                  onTokenSelect(option.value);
                  setIsOpen(false);
                }
              }}
              disabled={!option.isActive}
            >
              <span className="token-symbol">{option.symbol}</span>
              <span className="token-chain">{option.label.split(' on ')[1]}</span>
              {option.isActive ? (
                <span className="status-indicator active">●</span>
              ) : (
                <span className="status-indicator inactive">○</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
