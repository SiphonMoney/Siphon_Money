"use client";

import { useState } from "react";
import "./ProSwapMode.css";

interface ProSwapModeProps {
  isLoaded: boolean;
}

export default function ProSwapMode({
  isLoaded
}: ProSwapModeProps) {
  const [swaps, setSwaps] = useState([{ 
    strategyType: "swap",
    from: "SOL", 
    to: "USDC", 
    amount: "", 
    liquidityEnabled: false,
    liquidity: "internal", 
    stopLossEnabled: false,
    stopLoss: "",
    stopGain: "",
    liquidityChain: "SOL",
    chain: "SOL",
    dex: "Raydium"
  }]);
  const [withdrawInstructions, setWithdrawInstructions] = useState([
    { chain: "SOL", token: "USDC", amount: "", address: "" }
  ]);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [depositInputs, setDepositInputs] = useState([
    { chain: "SOL", token: "SOL", amount: "" }
  ]);

  // Toast notifications (top-right)
  type ToastStatus = 'pending' | 'success' | 'failed';
  interface ToastItem { id: number; title: string; message: string; status: ToastStatus }
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const pushToast = (title: string, message: string, status: ToastStatus = 'pending', ttlMs = 3500) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const toast: ToastItem = { id, title, message, status };
    setToasts((t) => [toast, ...t]);
    // auto-complete pending -> success after short delay
    if (status === 'pending') {
      window.setTimeout(() => {
        setToasts((curr) => curr.map((x) => x.id === id ? { ...x, status: 'success', message: 'Completed' } : x));
      }, Math.min(ttlMs - 1000, 2500));
    }
    // auto-remove
    window.setTimeout(() => {
      setToasts((curr) => curr.filter((x) => x.id !== id));
    }, ttlMs);
  };

  const pushProcessToast = (kind: 'deposit' | 'execution' | 'withdraw') => {
    const sequences: Record<string, string[]> = {
      deposit: [
        'Generating zk-commitments...',
        'Updating Merkle tree...',
        'Publishing encrypted note...',
        'Finalizing deposit receipt...'
      ],
      execution: [
        'Building private order...',
        'Generating proof...',
        'Submitting to matching engine...',
        'Aggregating in dark pool...'
      ],
      withdraw: [
        'Constructing nullifier...',
        'Verifying inclusion proof...',
        'Crafting withdrawal note...',
        'Broadcasting transaction...'
      ],
    };
    const steps = sequences[kind];
    const baseId = Date.now() + Math.floor(Math.random() * 1000);
    // Create a single toast and update its message as we go
    const make = (msg: string, status: ToastStatus = 'pending') => {
      const item: ToastItem = { id: baseId, title: kind.charAt(0).toUpperCase() + kind.slice(1), message: msg, status };
      setToasts((t) => {
        const exists = t.some((x) => x.id === baseId);
        return exists ? t.map((x) => (x.id === baseId ? item : x)) : [item, ...t];
      });
    };
    // Progress through steps
    steps.forEach((msg, idx) => {
      window.setTimeout(() => make(msg, 'pending'), idx * 800);
    });
    // Mark success and remove
    window.setTimeout(() => make('Completed', 'success'), steps.length * 800 + 300);
    window.setTimeout(() => setToasts((curr) => curr.filter((x) => x.id !== baseId)), steps.length * 800 + 2000);
  };

  const handleDeposit = () => {
    console.log(`Depositing to Siphon Vault`, depositInputs);
    pushProcessToast('deposit');
    setIsDepositing(true);
    window.setTimeout(() => setIsDepositing(false), 3600);
  };

  const handleSwap = () => {
    console.log('Executing Pro Strategy', swaps);
    pushProcessToast('execution');
    setIsExecuting(true);
    window.setTimeout(() => setIsExecuting(false), 3600);
  };

  const handleWithdraw = () => {
    console.log(`Withdrawing to addresses`, withdrawInstructions);
    pushProcessToast('withdraw');
    setIsWithdrawing(true);
    window.setTimeout(() => setIsWithdrawing(false), 3600);
  };

  const addSwap = () => {
    setSwaps([...swaps, { 
      strategyType: "swap",
      from: "SOL", 
      to: "USDC", 
      amount: "", 
      liquidityEnabled: false,
      liquidity: "internal", 
      stopLossEnabled: false,
      stopLoss: "",
      stopGain: "",
      liquidityChain: "SOL",
      chain: "SOL",
      dex: "Raydium"
    }]);
  };

  const removeSwap = (index: number) => {
    if (swaps.length > 1) {
      setSwaps(swaps.filter((_, i) => i !== index));
    }
  };

  const updateSwap = (index: number, field: string, value: string | boolean) => {
    const updatedSwaps = swaps.map((swap, i) => 
      i === index ? { ...swap, [field]: value } : swap
    );
    setSwaps(updatedSwaps);
  };

  const addWithdrawInstruction = () => {
    setWithdrawInstructions([...withdrawInstructions, { chain: "SOL", token: "USDC", amount: "", address: "" }]);
  };

  const removeWithdrawInstruction = (index: number) => {
    if (withdrawInstructions.length > 1) {
      setWithdrawInstructions(withdrawInstructions.filter((_, i) => i !== index));
    }
  };

  const updateWithdrawInstruction = (index: number, field: string, value: string) => {
    const updatedInstructions = withdrawInstructions.map((instruction, i) => 
      i === index ? { ...instruction, [field]: value } : instruction
    );
    setWithdrawInstructions(updatedInstructions);
  };

  const addDepositInput = () => {
    setDepositInputs([...depositInputs, { chain: "SOL", token: "SOL", amount: "" }]);
  };

  const removeDepositInput = (index: number) => {
    if (depositInputs.length > 1) {
      setDepositInputs(depositInputs.filter((_, i) => i !== index));
    }
  };

  const updateDepositInput = (index: number, field: string, value: string) => {
    const updatedInputs = depositInputs.map((input, i) => 
      i === index ? { ...input, [field]: value } : input
    );
    setDepositInputs(updatedInputs);
  };

  const calculateTotalDeposited = () => {
    const totals: { [key: string]: number } = {};
    
    depositInputs.forEach(input => {
      const amount = parseFloat(input.amount) || 0;
      if (amount > 0) {
        totals[input.token] = (totals[input.token] || 0) + amount;
      }
    });
    
    return totals;
  };

  const applyFee = (usd: number, feePct = 0.1) => {
    const after = usd * (1 - feePct / 100);
    return { after, label: `(-${feePct}%)` };
  };

  const getUSDEquivalent = (token: string, amount: number) => {
    // Mock prices - in real app these would come from price feeds
    const prices: { [key: string]: number } = {
      'SOL': 192,
      'USDC': 1,
      'USDT': 1,
      'WBTC': 45000,
      'XMR': 120
    };
    
    return amount * (prices[token] || 0);
  };

  const calculateTotalWithdrawn = () => {
    const totals: { [key: string]: number } = {};
    
    withdrawInstructions.forEach(instruction => {
      const amount = parseFloat(instruction.amount) || 0;
      if (amount > 0) {
        totals[instruction.token] = (totals[instruction.token] || 0) + amount;
      }
    });
    
    return totals;
  };

  const calculateSwapReceived = () => {
    const totals: { [key: string]: number } = {};
    
    swaps.forEach(swap => {
      const amount = parseFloat(swap.amount) || 0;
      if (amount > 0) {
        // Convert using mock prices (SOL=192, USDC=1, etc.)
        const price: { [key: string]: number } = { SOL: 192, USDC: 1, USDT: 1, WBTC: 45000, XMR: 120 };
        const pFrom = price[swap.from] ?? 0;
        const pTo = price[swap.to] ?? 0;
        const received = pFrom > 0 && pTo > 0 ? amount * (pFrom / pTo) : 0;
        totals[swap.to] = (totals[swap.to] || 0) + received;
      }
    });
    
    return totals;
  };

  return (
    <div className="pro-mode-wrapper">
      {/* Blurred Content */}
      <div className="pro-mode-blur-overlay">
        <div className={`three-columns ${isLoaded ? 'loaded' : ''}`}>
      {/* Toasts - top right */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`toast ${t.status}`}>
              <div className="toast-title">{t.title}</div>
              <div className="toast-message">{t.message}</div>
            </div>
          ))}
        </div>
      )}
      {/* Column 1: Deposit */}
      <div className="column">
        <div className="column-header">
          <div className="step-number">1</div>
          <h3 className="step-title" data-tooltip="Deposit your tokens to the Siphon Vault. Your funds are encrypted and anonymized using zero-knowledge proofs, making your transaction history completely private. Choose your blockchain network, select the token you want to deposit, enter the amount, and review the transaction details before proceeding.">Deposit</h3>
        </div>
        
        <div className="deposit-section">
          {depositInputs.map((input, index) => (
            <div key={index} className="deposit-item">
              <div className="deposit-header">
                <span className="deposit-label">Deposit {index + 1}</span>
                {depositInputs.length > 1 && (
                  <button 
                    className="remove-deposit"
                    onClick={() => removeDepositInput(index)}
                  >
                    ×
                  </button>
                )}
              </div>
              
              <div className="deposit-input-group">
                <div className="token-input">
                  <label>Chain</label>
                  <div className="token-selector">
                    <select
                      value={input.chain}
                      onChange={(e) => updateDepositInput(index, 'chain', e.target.value)}
                    >
                      <option value="SOL">Solana</option>
                      <option value="BTC" disabled>Bitcoin</option>
                      <option value="XMR">XMR</option>
                      <option value="ZCASH" disabled>ZCash</option>
                      <option value="LTC" disabled>Litecoin</option>
                    </select>
                  </div>
                </div>

                <div className="token-input">
                  <label>Token</label>
                  <div className="token-selector">
                    <select
                      value={input.token}
                      onChange={(e) => updateDepositInput(index, 'token', e.target.value)}
                    >
                      <option value="SOL">SOL</option>
                      <option value="USDC">USDC</option>
                      <option value="USDT">USDT</option>
                      <option value="WBTC">WBTC</option>
                      <option value="XMR">XMR</option>
                    </select>
                  </div>
                </div>

                <div className="token-input">
                  <label>Amount</label>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={input.amount}
                    onChange={(e) => updateDepositInput(index, 'amount', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          
           <button className="add-deposit-button" onClick={addDepositInput}>
             + Add Deposit
           </button>
         </div>
         
         <div className="deposit-stats">
           <div className="stat-row">
             <span>Total Deposits</span>
             <span>{depositInputs.length} transaction{depositInputs.length !== 1 ? 's' : ''}</span>
           </div>
           <div className="stat-row">
             <span>Deposit Fee</span>
             <span>0.01%</span>
           </div>
           <div className="stat-row">
             <span>Privacy Level</span>
             <span>Maximum</span>
           </div>
           <div className="stat-row">
             <span>Amount Deposited</span>
             <span>
               {(() => {
                 const totals = calculateTotalDeposited();
                 const totalUSD = Object.entries(totals).reduce((sum, [token, amount]) => 
                   sum + getUSDEquivalent(token, amount), 0
                 );
                 const { after: totalAfterFee, label: feeLabel } = applyFee(totalUSD, 0.1);
                 
                 if (totalUSD === 0) return 'No amount entered';
                 
                 const entries = Object.entries(totals).filter(([, amount]) => amount > 0);
                 if (entries.length === 1) {
                   const [token, amount] = entries[0];
                   return `${token} ${amount.toFixed(4)} ($${totalAfterFee.toFixed(2)} ${feeLabel})`;
                 } else {
                   return `$${totalAfterFee.toFixed(2)} total ${feeLabel}`;
                 }
               })()}
             </span>
           </div>
         </div>
         
        <button 
          className="action-button" 
          onClick={handleDeposit}
          disabled={isDepositing}
        >
          {isDepositing ? (
            <span className="loading-content"><span className="spinner"></span>Processing...</span>
          ) : (
            'Deposit to Vault'
          )}
        </button>
      </div>

      {/* Column 2: Strategy */}
      <div className="column">
        <div className="column-header">
          <div className="step-number">2</div>
          <h3 className="step-title" data-tooltip="Create complex trading strategies with multiple swaps. Each swap is executed privately within the vault using homomorphic encryption, ensuring your trading patterns remain completely anonymous. Build sophisticated trading strategies by adding multiple swaps. Each swap can convert different amounts of tokens, allowing for complex multi-step trading operations.">Strategy</h3>
        </div>
        
        <div className="column-content">
          <div className="strategy-section">
          {swaps.map((swap, index) => (
            <div key={index} className="swap-item">
              <div className="swap-header">
                <span className="swap-label">Strategy {index + 1}</span>
                {swaps.length > 1 && (
                  <button 
                    className="remove-swap"
                    onClick={() => removeSwap(index)}
                  >
                    ×
                  </button>
                )}
              </div>
              
              <div className="strategy-type-selector">
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name={`strategy-${index}`}
                      value="swap"
                      checked={swap.strategyType === "swap"}
                      onChange={(e) => updateSwap(index, 'strategyType', e.target.value)}
                    />
                    <span>Swap</span>
                  </label>
                  <label className="radio-option inactive">
                    <input
                      type="radio"
                      name={`strategy-${index}`}
                      value="long"
                      checked={swap.strategyType === "long"}
                      onChange={(e) => updateSwap(index, 'strategyType', e.target.value)}
                      disabled
                    />
                    <span>Long</span>
                  </label>
                  <label className="radio-option inactive">
                    <input
                      type="radio"
                      name={`strategy-${index}`}
                      value="short"
                      checked={swap.strategyType === "short"}
                      onChange={(e) => updateSwap(index, 'strategyType', e.target.value)}
                      disabled
                    />
                    <span>Short</span>
                  </label>
                </div>
              </div>
              
              <div className="swap-inputs">
                <div className="input-group">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={swap.amount}
                    onChange={(e) => updateSwap(index, 'amount', e.target.value)}
                  />
                  <div className="token-selector">
                    <select
                      value={swap.from}
                      onChange={(e) => updateSwap(index, 'from', e.target.value)}
                    >
                      <option value="SOL">SOL</option>
                      <option value="USDC">USDC</option>
                      <option value="USDT">USDT</option>
                      <option value="WBTC">WBTC</option>
                      <option value="XMR">XMR</option>
                    </select>
                  </div>
                </div>

                <div className="swap-arrow">→</div>

                <div className="input-group">
                  <div className="token-selector">
                    <select
                      value={swap.to}
                      onChange={(e) => updateSwap(index, 'to', e.target.value)}
                    >
                      <option value="SOL">SOL</option>
                      <option value="USDC">USDC</option>
                      <option value="USDT">USDT</option>
                      <option value="WBTC">WBTC</option>
                      <option value="XMR">XMR</option>
                    </select>
                  </div>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={(() => {
                      const price: { [key: string]: number } = { SOL: 192, USDC: 1, USDT: 1, WBTC: 45000, XMR: 120 };
                      const amount = parseFloat(swap.amount) || 0;
                      const pFrom = price[swap.from] ?? 0;
                      const pTo = price[swap.to] ?? 0;
                      if (!amount || !pFrom || !pTo) return "";
                      const out = amount * (pFrom / pTo);
                      return out.toFixed(4);
                    })()}
                    readOnly
                    className="output-amount"
                  />
                </div>
              </div>

              <div className="swap-options">
                <div className="option-group">
                  <div className="toggle-group">
                    <label className="toggle-option">
                      <input
                        type="checkbox"
                        checked={swap.liquidityEnabled}
                        onChange={(e) => updateSwap(index, 'liquidityEnabled', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">Use External Liquidity</span>
                    </label>
                  </div>
                </div>

                {swap.liquidityEnabled && (
                  <div className="external-liquidity-selector">
                    <label className="sub-option-label">External Liquidity Details</label>
                    <div className="chain-dex-row">
                      <div className="token-selector">
                        <select
                          value={swap.liquidityChain}
                          onChange={(e) => updateSwap(index, 'liquidityChain', e.target.value)}
                        >
                          <option value="SOL">Solana</option>
                          <option value="POLYGON">Polygon</option>
                          <option value="ARBITRUM">Arbitrum</option>
                          <option value="BASE">Base</option>
                          <option value="OPTIMISM">Optimism</option>
                        </select>
                      </div>
                      <div className="token-selector">
                        <select
                          value={swap.dex}
                          onChange={(e) => updateSwap(index, 'dex', e.target.value)}
                        >
                          <option value="Raydium">Raydium</option>
                          <option value="Orca">Orca</option>
                          <option value="Jupiter">Jupiter</option>
                          <option value="Serum">Serum</option>
                          <option value="Meteora">Meteora</option>
                          <option value="Aldrin">Aldrin</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {swap.strategyType === "swap" && (
                  <div className="option-group">
                    <div className="toggle-group">
                      <label className="toggle-option">
                        <input
                          type="checkbox"
                          checked={swap.stopLossEnabled}
                          onChange={(e) => updateSwap(index, 'stopLossEnabled', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">Enable Stop Loss & Take Profit</span>
                      </label>
                    </div>
                    
                    {swap.stopLossEnabled && (
                      <div className="stop-settings">
                        <div className="stop-input">
                          <label>Stop Loss Price</label>
                          <input
                            type="number"
                            placeholder="0.0"
                            value={swap.stopLoss}
                            onChange={(e) => updateSwap(index, 'stopLoss', e.target.value)}
                          />
                        </div>
                        <div className="stop-input">
                          <label>Take Profit Price</label>
                          <input
                            type="number"
                            placeholder="0.0"
                            value={swap.stopGain}
                            onChange={(e) => updateSwap(index, 'stopGain', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="swap-preview">
                <div className="preview-row">
                  <span>Rate</span>
                  <span>
                    {(() => {
                      const price: { [key: string]: number } = { SOL: 192, USDC: 1, USDT: 1, WBTC: 45000, XMR: 120 };
                      const pFrom = price[swap.from] ?? 0;
                      const pTo = price[swap.to] ?? 0;
                      if (pFrom > 0 && pTo > 0) {
                        const rate = pFrom / pTo;
                        return `1 ${swap.from} = ${rate.toFixed(2)} ${swap.to}`;
                      }
                      return `1 ${swap.from} = - ${swap.to}`;
                    })()}
                  </span>
                </div>
                <div className="preview-row">
                  <span>Slippage</span>
                  <span>{swap.liquidity === "internal" ? "0.1%" : "0.5%"}</span>
                </div>
                <div className="preview-row">
                  <span>Fee</span>
                  <span>{swap.liquidity === "internal" ? "0.05%" : "0.3%"}</span>
                </div>
              </div>
            </div>
          ))}
          
          <button className="add-swap-button" onClick={addSwap}>
            + Add Swap
          </button>
          </div>
        </div>
        
        <div className="strategy-stats">
          <div className="stat-row">
            <span>Total Swaps</span>
            <span>{swaps.length} transaction{swaps.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="stat-row">
            <span>Execution Fee</span>
            <span>0.1%</span>
          </div>
          <div className="stat-row">
            <span>Privacy Level</span>
            <span>Maximum</span>
          </div>
          <div className="stat-row">
            <span>Amount Received</span>
            <span>
              {(() => {
                const totals = calculateSwapReceived();
                const totalUSD = Object.entries(totals).reduce((sum, [token, amount]) => 
                  sum + getUSDEquivalent(token, amount), 0
                );
                const { after: totalAfterFee, label: feeLabel } = applyFee(totalUSD, 0.1);
                
                if (totalUSD === 0) return 'No amount entered';
                
                const entries = Object.entries(totals).filter(([, amount]) => amount > 0);
                if (entries.length === 1) {
                  const [token, amount] = entries[0];
                  return `${token} ${amount.toFixed(4)} ($${totalAfterFee.toFixed(2)} ${feeLabel})`;
                } else {
                  return `$${totalAfterFee.toFixed(2)} total ${feeLabel}`;
                }
              })()}
            </span>
          </div>
        </div>
        
        <button 
          className="action-button" 
          onClick={handleSwap}
          disabled={isExecuting}
        >
          {isExecuting ? (
            <span className="loading-content"><span className="spinner"></span>Executing...</span>
          ) : (
            'Execute Strategy'
          )}
        </button>
      </div>

      {/* Column 3: Withdraw */}
      <div className="column">
        <div className="column-header">
          <div className="step-number">3</div>
          <h3 className="step-title" data-tooltip="Withdraw your tokens to any wallet address. The withdrawal process uses advanced privacy techniques to break the transaction trail, ensuring your funds cannot be traced back to their original source. Configure multiple withdrawal outputs to different wallet addresses. Specify the exact amount and token for each output, enabling complex distribution strategies.">Withdraw</h3>
        </div>
        
        <div className="column-content">
          <div className="withdraw-section">
          {withdrawInstructions.map((instruction, index) => (
            <div key={index} className="withdraw-item">
              <div className="withdraw-header">
                <span className="withdraw-label">Output {index + 1}</span>
                {withdrawInstructions.length > 1 && (
                  <button 
                    className="remove-withdraw"
                    onClick={() => removeWithdrawInstruction(index)}
                  >
                    ×
                  </button>
                )}
              </div>
              
              <div className="withdraw-inputs">
                <div className="deposit-input-group">
                  <div className="token-input">
                    <label>Chain</label>
                    <div className="token-selector">
                      <select
                        value={instruction.chain}
                        onChange={(e) => updateWithdrawInstruction(index, 'chain', e.target.value)}
                      >
                        <option value="SOL">Solana</option>
                        <option value="OPTIMISM">Optimism</option>
                        <option value="BASE">Base</option>
                        <option value="ARBITRUM">Arbitrum</option>
                        <option value="XMR" disabled>XMR</option>
                        <option value="ZCASH" disabled>ZCash</option>
                      </select>
                    </div>
                  </div>

                  <div className="token-input">
                    <label>Token</label>
                    <div className="token-selector">
                      <select
                        value={instruction.token}
                        onChange={(e) => updateWithdrawInstruction(index, 'token', e.target.value)}
                      >
                        <option value="SOL">SOL</option>
                        <option value="USDC">USDC</option>
                        <option value="USDT">USDT</option>
                        <option value="WBTC">WBTC</option>
                        <option value="XMR">XMR</option>
                      </select>
                    </div>
                  </div>

                  <div className="token-input">
                    <label>Amount</label>
                    <input
                      type="number"
                      placeholder="0.0"
                      value={instruction.amount}
                      onChange={(e) => updateWithdrawInstruction(index, 'amount', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="wallet-input">
                  <label>Wallet Address</label>
                  <input
                    type="text"
                    placeholder="Enter wallet address"
                    value={instruction.address}
                    onChange={(e) => updateWithdrawInstruction(index, 'address', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button className="add-withdraw-button" onClick={addWithdrawInstruction}>
            + Add Output
          </button>
          </div>
        </div>
        
        <div className="withdraw-stats">
          <div className="stat-row">
            <span>Total Outputs</span>
            <span>{withdrawInstructions.length} transaction{withdrawInstructions.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="stat-row">
            <span>Withdrawal Fee</span>
            <span>0.03%</span>
          </div>
          <div className="stat-row">
            <span>Privacy Level</span>
            <span>Maximum</span>
          </div>
          <div className="stat-row">
            <span>Amount Withdrawn</span>
            <span>
              {(() => {
                const totals = calculateTotalWithdrawn();
                const totalUSD = Object.entries(totals).reduce((sum, [token, amount]) => 
                  sum + getUSDEquivalent(token, amount), 0
                );
                const { after: totalAfterFee, label: feeLabel } = applyFee(totalUSD, 0.1);
                
                if (totalUSD === 0) return 'No amount entered';
                
                const entries = Object.entries(totals).filter(([, amount]) => amount > 0);
                if (entries.length === 1) {
                  const [token, amount] = entries[0];
                  return `${token} ${amount.toFixed(4)} ($${totalAfterFee.toFixed(2)} ${feeLabel})`;
                } else {
                  return `$${totalAfterFee.toFixed(2)} total ${feeLabel}`;
                }
              })()}
            </span>
          </div>
        </div>
        
        <button 
          className="action-button" 
          onClick={handleWithdraw}
          disabled={isWithdrawing}
        >
          {isWithdrawing ? (
            <span className="loading-content"><span className="spinner"></span>Withdrawing...</span>
          ) : (
            'Execute Withdrawals'
          )}
        </button>
      </div>
    </div>
      </div>

      {/* Coming Soon Overlay */}
      <div className="pro-mode-coming-soon-overlay">
        <div className="pro-mode-coming-soon-content">
          <span className="coming-soon-icon">⚡</span>
          <h3>Pro Mode Coming Soon</h3>
          <p>Advanced multi-chain swap aggregation with privacy-preserving order batching</p>
          <div className="pro-mode-features">
            <div className="feature-item">✓ Multi-step swap strategies</div>
            <div className="feature-item">✓ Cross-chain liquidity routing</div>
            <div className="feature-item">✓ Encrypted batch execution</div>
            <div className="feature-item">✓ Zero-knowledge proof verification</div>
          </div>
        </div>
      </div>
    </div>
  );
}
