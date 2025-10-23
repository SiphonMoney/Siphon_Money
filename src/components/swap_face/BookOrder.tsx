"use client";

import { useState } from "react";
import "./ProSwapMode.css";
import PriceChart from "./extensions/PriceChart";

interface DarkPoolProps {
  isLoaded: boolean;
  walletConnected: boolean;
  connectedWallet: unknown;
  onWalletConnected: (wallet: unknown) => void;
}

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export default function BookOrder({
  isLoaded
}: DarkPoolProps) {
  const [selectedPair, setSelectedPair] = useState("SOL/USDC");
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [orderAmount, setOrderAmount] = useState("");
  const [orderPrice, setOrderPrice] = useState("");
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'>('1h');
  const [bottomView, setBottomView] = useState<'orderbook' | 'recent'>('orderbook');

  // Mock order book data - updated for privacy coins
  const [orderBook, setOrderBook] = useState({
    bids: [
      { price: 0.126, amount: 1250.0, total: 157.5 },
      { price: 0.1258, amount: 2100.0, total: 264.18 },
      { price: 0.1256, amount: 850.0, total: 106.76 },
      { price: 0.1254, amount: 3200.0, total: 401.28 },
      { price: 0.1252, amount: 1500.0, total: 187.8 },
      { price: 0.125, amount: 2800.0, total: 350.0 },
      { price: 0.1248, amount: 1150.0, total: 143.52 },
      { price: 0.1246, amount: 4500.0, total: 560.7 },
    ] as OrderBookEntry[],
    asks: [
      { price: 0.1262, amount: 1800.0, total: 227.16 },
      { price: 0.1264, amount: 2300.0, total: 290.72 },
      { price: 0.1266, amount: 950.0, total: 120.27 },
      { price: 0.1268, amount: 1400.0, total: 177.52 },
      { price: 0.127, amount: 2600.0, total: 330.2 },
      { price: 0.1272, amount: 1750.0, total: 222.6 },
      { price: 0.1274, amount: 3200.0, total: 407.68 },
      { price: 0.1276, amount: 900.0, total: 114.84 },
    ] as OrderBookEntry[]
  });

  // Mock 24h stats data
  const stats24h = {
    high: 0.1285,
    low: 0.1242,
    volume: 2847500.0,
    change: 0.0023,
    changePercent: 1.85
  };

  // Mock recent activities data
  const recentActivities = [
    { time: "14:32:15", type: "buy", amount: 1250.0, price: 0.1268, total: 158.5 },
    { time: "14:31:42", type: "sell", amount: 850.0, price: 0.1265, total: 107.525 },
    { time: "14:30:18", type: "buy", amount: 2100.0, price: 0.1262, total: 265.02 },
    { time: "14:29:55", type: "sell", amount: 950.0, price: 0.1260, total: 119.7 },
    { time: "14:28:33", type: "buy", amount: 1800.0, price: 0.1258, total: 226.44 },
    { time: "14:27:21", type: "sell", amount: 1400.0, price: 0.1256, total: 175.84 },
    { time: "14:26:07", type: "buy", amount: 3200.0, price: 0.1254, total: 401.28 },
    { time: "14:25:44", type: "sell", amount: 1150.0, price: 0.1252, total: 143.98 }
  ];

  const handlePlaceOrder = () => {
    if (!orderAmount || !orderPrice) {
      alert('Please enter both amount and price');
      return;
    }

    const newOrder = {
      price: parseFloat(orderPrice),
      amount: parseFloat(orderAmount),
      total: parseFloat(orderPrice) * parseFloat(orderAmount)
    };

    if (orderType === 'buy') {
      setOrderBook(prev => ({
        ...prev,
        bids: [...prev.bids, newOrder].sort((a, b) => b.price - a.price)
      }));
    } else {
      setOrderBook(prev => ({
        ...prev,
        asks: [...prev.asks, newOrder].sort((a, b) => a.price - b.price)
      }));
    }

    setOrderAmount("");
    setOrderPrice("");
    alert(`${orderType === 'buy' ? 'Buy' : 'Sell'} order placed successfully!`);
  };

  return (
    <div className={`darkpool-container ${isLoaded ? 'loaded' : ''}`}>
      {/* Header */}
      <div className="darkpool-header">
        <h2>Dark Pool Trading</h2>
        <div className="trading-pair-selector">
          <button 
            className={`pair-button ${selectedPair === 'SOL/USDC' ? 'active' : ''}`}
            onClick={() => setSelectedPair('SOL/USDC')}
          >
            SOL/USDC
          </button>
          <button 
            className={`pair-button ${selectedPair === 'XMR/SOL' ? 'active' : ''}`}
            onClick={() => setSelectedPair('XMR/SOL')}
          >
            XMR/SOL
          </button>
          <button 
            className={`pair-button ${selectedPair === 'ZEC/SOL' ? 'active' : ''}`}
            onClick={() => setSelectedPair('ZEC/SOL')}
          >
            ZEC/SOL
          </button>
        </div>
      </div>

      {/* Top Row: Chart (2/3) + Order Form (1/3) */}
      <div className="darkpool-top-row">
        {/* Chart Section - 2/3 width */}
        <div className="chart-section">
          <div className="chart-header">
            <span className="chart-title">Price Chart</span>
            <div className="timeframe-selector">
              <button 
                className={`timeframe-btn ${timeframe === '1m' ? 'active' : ''}`}
                onClick={() => setTimeframe('1m')}
              >
                1m
              </button>
              <button 
                className={`timeframe-btn ${timeframe === '5m' ? 'active' : ''}`}
                onClick={() => setTimeframe('5m')}
              >
                5m
              </button>
              <button 
                className={`timeframe-btn ${timeframe === '15m' ? 'active' : ''}`}
                onClick={() => setTimeframe('15m')}
              >
                15m
              </button>
              <button 
                className={`timeframe-btn ${timeframe === '1h' ? 'active' : ''}`}
                onClick={() => setTimeframe('1h')}
              >
                1h
              </button>
              <button 
                className={`timeframe-btn ${timeframe === '4h' ? 'active' : ''}`}
                onClick={() => setTimeframe('4h')}
              >
                4h
              </button>
              <button 
                className={`timeframe-btn ${timeframe === '1d' ? 'active' : ''}`}
                onClick={() => setTimeframe('1d')}
              >
                1d
              </button>
            </div>
          </div>
          
          {/* 24h Stats */}
          <div className="stats-24h">
            <div className="stat-item">
              <span className="stat-label">24h High</span>
              <span className="stat-value">{stats24h.high.toFixed(4)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">24h Low</span>
              <span className="stat-value">{stats24h.low.toFixed(4)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">24h Volume</span>
              <span className="stat-value">{(stats24h.volume / 1000000).toFixed(2)}M</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">24h Change</span>
              <span className={`stat-value ${stats24h.change >= 0 ? 'positive' : 'negative'}`}>
                {stats24h.change >= 0 ? '+' : ''}{stats24h.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="chart-container">
            <PriceChart pair={selectedPair} timeframe={timeframe} />
          </div>
        </div>

        {/* Order Form Section - 1/3 width */}
        <div className="order-form-section">
          <div className="order-form-header">
            <span className="order-title">Place Order</span>
          </div>
          
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
              disabled={!orderAmount || !orderPrice}
            >
              Place {orderType === 'buy' ? 'Buy' : 'Sell'} Order
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Order Book / Recent Activities - Full Width */}
      <div className="darkpool-bottom-row">
        <div className="orderbook-header">
          <span className="orderbook-title">
            {bottomView === 'orderbook' ? 'Order Book' : 'Recent Activity'}
          </span>
          <div className="view-selector">
            <button 
              className={`view-btn ${bottomView === 'orderbook' ? 'active' : ''}`}
              onClick={() => setBottomView('orderbook')}
            >
              Order Book
            </button>
            <button 
              className={`view-btn ${bottomView === 'recent' ? 'active' : ''}`}
              onClick={() => setBottomView('recent')}
            >
              Recent Activity
            </button>
          </div>
        </div>
        
        <div className="orderbook-container">
          {bottomView === 'orderbook' ? (
            <div className="orderbook-grid">
              {/* Asks (Sell Orders) */}
              <div className="orderbook-side asks-side">
                <div className="orderbook-header-row">
                  <span>Price (SOL)</span>
                  <span>Amount</span>
                  <span>Total</span>
                </div>
                {orderBook.asks.map((ask, index) => (
                  <div key={index} className="orderbook-row ask-row">
                    <span className="price">{ask.price.toFixed(4)}</span>
                    <span className="amount">{ask.amount.toFixed(2)}</span>
                    <span className="total">{ask.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Bids (Buy Orders) */}
              <div className="orderbook-side bids-side">
                <div className="orderbook-header-row">
                  <span>Price (SOL)</span>
                  <span>Amount</span>
                  <span>Total</span>
                </div>
                {orderBook.bids.map((bid, index) => (
                  <div key={index} className="orderbook-row bid-row">
                    <span className="price">{bid.price.toFixed(4)}</span>
                    <span className="amount">{bid.amount.toFixed(2)}</span>
                    <span className="total">{bid.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="recent-activities">
              <div className="activity-header-row">
                <span>Time</span>
                <span>Type</span>
                <span>Amount</span>
                <span>Price</span>
                <span>Total</span>
              </div>
              {recentActivities.map((activity, index) => (
                <div key={index} className={`activity-row ${activity.type}-row`}>
                  <span className="time">{activity.time}</span>
                  <span className={`type ${activity.type}`}>
                    {activity.type.toUpperCase()}
                  </span>
                  <span className="amount">{activity.amount.toFixed(2)}</span>
                  <span className="price">{activity.price.toFixed(4)}</span>
                  <span className="total">{activity.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

  
    </div>
  );
}