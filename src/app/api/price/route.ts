import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') || '1';
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=${days}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch price data');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching price data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price data' },
      { status: 500 }
    );
  }
}

