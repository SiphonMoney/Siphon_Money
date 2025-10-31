"use client";

import { useState, useRef, useEffect } from "react";
import "./ProSwapMode.css";
import PriceChart from "./extensions/PriceChart";
import { OrderParams } from "../../lib/matchingEngine";
import { WalletInfo } from "../../lib/walletManager";

interface DarkPoolProps {
  isLoaded: boolean;
  walletConnected: boolean;
  connectedWallet: WalletInfo | null;
  onWalletConnected: (wallet: WalletInfo) => void;
}

export default function BookOrder({
  isLoaded,
  walletConnected,
  connectedWallet,
  onWalletConnected
}: DarkPoolProps) {
  const [selectedPair, setSelectedPair] = useState("SOL/USDC");
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [orderAmount, setOrderAmount] = useState("");
  const [orderPrice, setOrderPrice] = useState("192");
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'>('1h');
  const [rightPanelView, setRightPanelView] = useState<'order' | 'liquidity'>('liquidity');
  const [chartView, setChartView] = useState<'price' | 'execution'>('price');
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const BASE_SOL_USD = 192;
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  const [activeLogIndex, setActiveLogIndex] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const loadingTimers = useRef<number[]>([] as number[]);
  const pushLocalTransaction = (entry: { id: string; type: 'buy' | 'sell'; amount: number; price: number; total: number; status: 'pending' | 'completed' | 'failed'; pair: string; timestamp?: string; }) => {
    try {
      const key = 'siphon-mock-transactions';
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      const timestamp = new Date().toISOString();
      const tx = { ...entry, timestamp };
      const next = [tx, ...arr];
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event('siphon-tx-updated'));
    } catch {}
  };

  const updateLocalTransactionStatus = (id: string, status: 'completed' | 'failed') => {
    try {
      const key = 'siphon-mock-transactions';
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      const next = arr.map((t: any) => t.id === id ? { ...t, status } : t);
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event('siphon-tx-updated'));
    } catch {}
  };

  const openLoadingModal = (logs: string[]) => {
    // Clear any previous timers
    loadingTimers.current.forEach((t: number) => window.clearTimeout(t));
    loadingTimers.current = [];
    setLoadingLogs(logs);
    setActiveLogIndex(0);
    setIsLoadingModalOpen(true);
    logs.forEach((_, idx) => {
      if (idx === 0) return;
      const timer = window.setTimeout(() => setActiveLogIndex(idx), idx * 800);
      loadingTimers.current.push(timer);
    });
  };

  const closeLoadingModal = () => {
    loadingTimers.current.forEach((t: number) => window.clearTimeout(t));
    loadingTimers.current = [];
    setIsLoadingModalOpen(false);
    setLoadingLogs([]);
    setActiveLogIndex(0);
  };
  
  // Liquidity management state
  const [liquidityAction, setLiquidityAction] = useState<'add' | 'remove'>('add');
  const [solAmount, setSolAmount] = useState("");
  const [usdcAmount, setUsdcAmount] = useState("");

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;
    if (!orderAmount || !orderPrice) {
      alert('Please enter both amount and price');
      return;
    }

    if (!walletConnected || !connectedWallet) {
      alert('Please connect your wallet first');
      return;
    }

    if (selectedPair !== 'SOL/USDC') {
      alert('Only SOL/USDC trading is currently supported');
      return;
    }

    try {
      setIsPlacingOrder(true);
      // Prepare order parameters
      const orderParams: OrderParams = {
        amount: parseFloat(orderAmount),
        price: parseFloat(orderPrice),
        orderType,
        orderId: Date.now() // Simple order ID generation
      };

      // Mock: insert a pending local transaction and show loading modal
      const txId = `local_${orderParams.orderId}`;
      pushLocalTransaction({
        id: txId,
        type: orderType,
        amount: orderParams.amount,
        price: orderParams.price,
        total: orderParams.amount * orderParams.price,
        status: 'pending',
        pair: selectedPair
      });

      openLoadingModal([
        'Opening Phantom Wallet...',
        'Waiting for user approval...',
        'Creating transaction...',
        'Submitting to dark pool...',
        'Awaiting confirmations (1/2)...',
        'Awaiting confirmations (2/2)...',
        'Finalizing...'
      ]);

      // Simulate network delay and then mark completed
      window.setTimeout(() => {
        updateLocalTransactionStatus(txId, 'completed');
        closeLoadingModal();
      }, 3800);

      setOrderAmount("");
      setOrderPrice("");
    } catch (error) {
      console.error('Failed to place order:', error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className={`darkpool-container ${isLoaded ? 'loaded' : ''}`}>
      {/* Header */}
      <div className="darkpool-header">
        
        <div className="darkpool-header-left">

          <div className="trading-pair-selector">
            <button 
              className={`pair-button ${selectedPair === 'SOL/USDC' ? 'active' : ''}`}
              onClick={() => setSelectedPair('SOL/USDC')}
            >
              SOL/USDC
            </button>
            <button 
              className={`pair-button example-pool ${selectedPair === 'XMR/SOL' ? 'active' : ''}`}
              onClick={() => setSelectedPair('XMR/SOL')}
              disabled
            >
              XMR/SOL
              <span className="example-label">(Soon)</span>
            </button>
            <button 
              className={`pair-button example-pool ${selectedPair === 'ZEC/SOL' ? 'active' : ''}`}
              onClick={() => setSelectedPair('ZEC/SOL')}
              disabled
            >
              ZEC/SOL
              <span className="example-label">(Soon)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Row: Chart (2/3) + Order Form (1/3) */}
      <div className="darkpool-top-row">
        {/* Chart Section - 2/3 width */}
        <div className="chart-section">
          {/* Chart Type Toggle */}
          <div className="chart-type-toggle">
            <button 
              className={`chart-type-btn ${chartView === 'price' ? 'active' : ''}`}
              onClick={() => setChartView('price')}
            >
              Price Chart
            </button>
            <button 
              className={`chart-type-btn ${chartView === 'execution' ? 'active' : ''}`}
              onClick={() => setChartView('execution')}
            >
              Order Execution Prices
            </button>
          </div>

          <div className="chart-header">
            <span className="chart-title">{chartView === 'price' ? 'Historical Price Data' : 'Order Execution Prices'}</span>
            <div className="timeframe-selector">
              <button 
                className={`timeframe-btn ${timeframe === '1m' ? 'active' : ''}`}
                onClick={() => setTimeframe('1m')}
                disabled={chartView === 'execution'}
              >
                1m
              </button>
              <button 
                className={`timeframe-btn ${timeframe === '5m' ? 'active' : ''}`}
                onClick={() => setTimeframe('5m')}
                disabled={chartView === 'execution'}
              >
                5m
              </button>
              <button 
                className={`timeframe-btn ${timeframe === '15m' ? 'active' : ''}`}
                onClick={() => setTimeframe('15m')}
                disabled={chartView === 'execution'}
              >
                15m
              </button>
              <button 
                className={`timeframe-btn ${timeframe === '1h' ? 'active' : ''}`}
                onClick={() => setTimeframe('1h')}
                disabled={chartView === 'execution'}
              >
                1h
              </button>
              <button 
                className={`timeframe-btn ${timeframe === '4h' ? 'active' : ''}`}
                onClick={() => setTimeframe('4h')}
                disabled={chartView === 'execution'}
              >
                4h
              </button>
              <button 
                className={`timeframe-btn ${timeframe === '1d' ? 'active' : ''}`}
                onClick={() => setTimeframe('1d')}
                disabled={chartView === 'execution'}
              >
                1d
              </button>
            </div>
          </div>
          
          {chartView === 'price' ? (
            <div className="chart-container">
              <PriceChart 
                pair={selectedPair} 
                timeframe={timeframe}
                forceMock={true}
                mockBasePrice={192}
              />
            </div>
          ) : (
            <div className="chart-container chart-coming-soon">
              <div className="chart-blur-overlay">
                <PriceChart 
                  pair={selectedPair} 
                  timeframe={timeframe}
                  forceMock={true}
                  mockBasePrice={192}
                />
              </div>
              <div className="coming-soon-overlay">
                <div className="coming-soon-content">
                  <span className="coming-soon-icon">🚧</span>
                  <h3>Coming Soon</h3>
                  <p>Order execution price tracking will be available soon</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Form + Liquidity Section - 1/3 width */}
        <div className="order-form-section">
          <div className="order-form-header">
            <div className="view-toggle">
              <span 
                className={`view-toggle-text ${rightPanelView === 'liquidity' ? 'active' : ''}`}
                onClick={() => setRightPanelView('liquidity')}
              >
                Manage Liquidity
              </span>
              <span 
                className={`view-toggle-text ${rightPanelView === 'order' ? 'active' : ''}`}
                onClick={() => setRightPanelView('order')}
              >
                Place Order
              </span>
            </div>
          </div>
          
          {rightPanelView === 'order' ? (
          <div className="order-form-content">
            <div className="order-type-selector">
              <button 
                className={`order-type-button ${orderType === 'buy' ? 'active' : ''}`}
                onClick={() => setOrderType('buy')}
              >
                Buy
              </button>
              <button 
                className={`order-type-button ${orderType === 'sell' ? 'active' : ''}`}
                onClick={() => setOrderType('sell')}
              >
                Sell
              </button>
            </div>
            
            <div className="form-group">
              <label>Amount ({selectedPair.split('/')[0]})</label>
              <input
                type="number"
                placeholder="0.0"
                value={orderAmount}
                onChange={(e) => setOrderAmount(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Price (USDC)</label>
              <input
                type="number"
                placeholder="0.0"
                value={orderPrice}
                onChange={(e) => setOrderPrice(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Total (USDC)</label>
              <input
                type="number"
                placeholder="0.0"
                value={orderAmount && orderPrice ? (parseFloat(orderAmount) * parseFloat(orderPrice)).toFixed(2) : ""}
                readOnly
              />
            </div>

            <button 
              className="place-order-button" 
              onClick={handlePlaceOrder}
              disabled={!orderAmount || !orderPrice || isPlacingOrder}
            >
              {isPlacingOrder ? (
                <span className="loading-content"><span className="spinner"></span>Placing...</span>
              ) : (
                <>Place {orderType === 'buy' ? 'Buy' : 'Sell'} Order</>
              )}
            </button>
          </div>
          ) : (
          <div className="manage-liquidity-section">
            <div className="action-selector-inline">
              <button 
                className={`action-btn ${liquidityAction === 'add' ? 'active' : ''}`}
                onClick={() => setLiquidityAction('add')}
              >
                Add
              </button>
              <button 
                className={`action-btn ${liquidityAction === 'remove' ? 'active' : ''}`}
                onClick={() => setLiquidityAction('remove')}
              >
                Remove
              </button>
            </div>
            
            <div className="liquidity-content">
            {liquidityAction === 'add' ? (
              <div className="add-liquidity">
                <div className="form-group">
                  <label>SOL Amount</label>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={solAmount}
                    onChange={(e) => setSolAmount(e.target.value)}
                  />
                  <div className="inline-rate-hint">
                    {solAmount ? (
                      <span>
                        ≈ ${ (parseFloat(solAmount || '0') * BASE_SOL_USD).toFixed(2) } @ ${BASE_SOL_USD} <span className="pct muted">(-0.03%)</span>
                      </span>
                    ) : (
                      <span>Rate: ${BASE_SOL_USD} per SOL <span className="pct muted">(-0.03%)</span></span>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>USDC Amount</label>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={usdcAmount}
                    onChange={(e) => setUsdcAmount(e.target.value)}
                  />
                </div>
                <button 
                  className="liquidity-button"
                  disabled={!solAmount || !usdcAmount}
                  onClick={() => {
                    openLoadingModal([
                      'Preparing liquidity add...',
                      'Opening Phantom Wallet...',
                      'Waiting for user approval...',
                      'Creating transaction...',
                      'Submitting to pool...',
                      'Awaiting confirmations...',
                      'Finalizing...'
                    ]);
                    window.setTimeout(() => {
                      closeLoadingModal();
                    }, 3200);
                  }}
                >
                  Add Liquidity
                </button>
              </div>
            ) : (
              <div className="remove-liquidity">
                <div className="form-group">
                  <label>Remove Percentage</label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="removal-info">
                  <div className="info-row">
                    <span>SOL to receive:</span>
                    <span>0.0</span>
                  </div>
                  <div className="info-row">
                    <span>USDC to receive:</span>
                    <span>0.0</span>
                  </div>
                </div>
                <button 
                  className="liquidity-button"
                  disabled={true}
                >
                  Remove Liquidity
                </button>
              </div>
            )}
          </div>
          </div>
          )}
        </div>
      </div>

      {isLoadingModalOpen && (
        <div className="loading-modal-backdrop" onClick={closeLoadingModal}>
          <div className="loading-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Processing</h4>
            <div className="loading-logs">
              {loadingLogs.map((log, idx) => (
                <div key={idx} className={`loading-log ${idx <= activeLogIndex ? 'active' : ''}`}>
                  <span className="bullet">{idx < activeLogIndex ? '✔' : idx === activeLogIndex ? '•' : '○'}</span>
                  <span className="text">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
  
    </div>
  );
}