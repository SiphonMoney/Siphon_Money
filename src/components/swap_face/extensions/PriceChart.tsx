"use client";

import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

interface PriceData {
  time: string;
  price: number;
  volume: number;
}

interface PriceChartProps {
  pair: string;
  timeframe?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  leftLabel?: string;
  leftValue?: string;
  forceMock?: boolean;
  mockBasePrice?: number;
}

// Fetch real SOL/USDC price data from our API route
const fetchPriceData = async () => {
  try {
    // Fetch last 24 hours of price data via our API route
    const response = await fetch('/api/price?days=1');
    
    if (!response.ok) {
      throw new Error('Failed to fetch price data');
    }
    
    const data = await response.json();
    
    // Convert to our format and ensure chronological order
    const sortedPrices = [...data.prices].sort((a: [number, number], b: [number, number]) => a[0] - b[0]);
    
    return sortedPrices.map((point: [number, number], index: number) => {
      const date = new Date(point[0]);
      return {
        time: date.toISOString().slice(11, 16), // HH:MM format
        price: point[1],
        volume: Math.random() * 1000000 + 500000, // Volume is not in the API, using mock
      };
    });
  } catch (error) {
    console.error('Error fetching price data:', error);
    // Fallback to mock data
    return generateMockData('SOL/USDC');
  }
};

// Generate mock price data as fallback
const generateMockData = (pair: string, overrideBase?: number) => {
  const data: PriceData[] = [];
  const now = new Date();
  const basePrice = overrideBase !== undefined ? overrideBase : (pair.includes('SOL') ? 201 : pair.includes('ETH') ? 3000 : 45000);
  
  // Generate data points for the last 24 hours
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    
    // Simulate realistic price movements
    const volatility = 0.02; // 2% volatility
    const trend = Math.sin(hour / 24 * Math.PI * 2) * 0.01; // Daily cycle
    const randomWalk = (Math.random() - 0.5) * volatility;
    
    const priceChange = trend + randomWalk;
    const price = basePrice * (1 + priceChange);
    const volume = Math.random() * 1000000 + 500000; // Random volume
    
    data.push({
      time: time.toISOString().slice(11, 16), // HH:MM format
      price: Math.round(price * 100) / 100,
      volume: Math.round(volume),
    });
  }
  
  return data;
};

export default function PriceChart({ pair, timeframe = '1h', leftLabel, leftValue, forceMock = false, mockBasePrice }: PriceChartProps) {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Only fetch once on mount
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        if (forceMock) {
          const data = generateMockData(pair, mockBasePrice);
          setPriceData(data);
          const latest = data[data.length - 1];
          const earliest = data[0];
          setCurrentPrice(latest.price);
          const change = earliest.price > 0 ? ((latest.price - earliest.price) / earliest.price) * 100 : 0;
          setPriceChange(change);
        } else {
          const data = await fetchPriceData();
          setPriceData(data);
          if (data.length > 0) {
            const startIndex = Math.max(0, data.length - 25);
            const latest = data[data.length - 1];
            const earliest = data[startIndex];
            setCurrentPrice(latest.price);
            if (earliest.price > 0 && latest.price > 0) {
              const change = ((latest.price - earliest.price) / earliest.price) * 100;
              setPriceChange(change);
            } else {
              setPriceChange(0);
            }
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load price data:', error);
        // Fallback to mock
        const data = generateMockData(pair, mockBasePrice);
        setPriceData(data);
        const latest = data[data.length - 1];
        const earliest = data[0];
        setCurrentPrice(latest.price);
        const change = earliest.price > 0 ? ((latest.price - earliest.price) / earliest.price) * 100 : 0;
        setPriceChange(change);
        setIsLoading(false);
      }
    };

    loadData();
  }, [forceMock, mockBasePrice, pair]);

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  if (isLoading) {
    return (
      <div className="price-chart loading">
        <div className="chart-header">
          <div className="loading-spinner"></div>
        </div>
        <div className="chart-placeholder">
          <div className="loading-text">Loading chart data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="price-chart">
      <div className="chart-header">
        <div className="price-info">
          <span className="current-price">{formatPrice(currentPrice)}</span>
        </div>
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={priceData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#667eea" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="time" 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
              }}
              formatter={(value: number, name: string) => [
                name === 'price' ? formatPrice(value) : formatVolume(value),
                name === 'price' ? 'Price' : 'Volume'
              ]}
              labelStyle={{ color: 'white' }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#667eea"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
    </div>
  );
}
