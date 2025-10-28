'use client';

import { useState } from 'react';

interface ToTokenOption {
  value: string;
  label: string;
  symbol: string;
  shortName: string;
  active: boolean;
}

const toTokenOptions: ToTokenOption[] = [
  { value: 'USDC-Solana', label: 'USDC on Solana', symbol: 'USDC', shortName: 'S', active: true },
  { value: 'SOL-Solana', label: 'SOL on Solana', symbol: 'SOL', shortName: 'S', active: false },
  { value: 'BTC-Bitcoin', label: 'BTC on Bitcoin', symbol: 'BTC', shortName: 'B', active: false },
  { value: 'XMR-Monero', label: 'XMR on Monero', symbol: 'XMR', shortName: 'M', active: false },
  { value: 'ZEC-Zcash', label: 'ZEC on Zcash', symbol: 'ZEC', shortName: 'Z', active: false },
  { value: 'PYTH-Solana', label: 'PYTH on Solana', symbol: 'PYTH', shortName: 'S', active: false },
];

interface ToTokenSelectorProps {
  selectedToken: string;
  onTokenSelect: (token: string) => void;
  className?: string;
}

export default function ToTokenSelector({ selectedToken, onTokenSelect, className }: ToTokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = toTokenOptions.find(option => option.value === selectedToken);
  const displayText = selectedOption ? (
    <span>
      {selectedOption.symbol} <span className="chain-short">{selectedOption.shortName}</span>
    </span>
  ) : 'Select Token';

  return (
    <div className="token-selector-custom">
      <button 
        className={`token-selector-button ${className} ${!selectedOption?.active ? 'inactive' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={!selectedOption?.active}
      >
        {displayText}
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="token-dropdown">
          {toTokenOptions.map((option) => (
            <button
              key={option.value}
              className={`token-option ${!option.active ? 'inactive' : ''}`}
              onClick={() => {
                if (option.active) {
                  onTokenSelect(option.value);
                  setIsOpen(false);
                }
              }}
              disabled={!option.active}
            >
              <span className="token-symbol">{option.symbol}</span>
              <span className="token-chain">{option.label.split(' on ')[1]}</span>
              {option.active ? (
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
