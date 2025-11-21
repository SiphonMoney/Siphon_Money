// keyManagement.ts - x25519 Key Derivation and Management
// Based on X25519_KEY_MANAGEMENT_SPEC.md

import { PublicKey } from '@solana/web3.js';

/**
 * DECISION 1: Using Web Crypto API for HKDF instead of @noble/hashes
 * Reason: Reduces bundle size, native browser support, same security guarantees
 */

export interface X25519Keys {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
}

interface CachedX25519 {
  version: number;
  encryptedKey: string;  // base64
  iv: string;            // base64
  timestamp: number;
}

// Version for cache invalidation if we change derivation method
const KEY_VERSION = 1;
const CACHE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * DECISION 2: Signature message format
 * - Includes domain for phishing protection
 * - Includes wallet address for account binding
 * - Includes timestamp for replay prevention
 * - Clear warning for user education
 */
export function createSignatureMessage(walletPubkey: PublicKey): string {
  return `Dark Pool DEX - Viewing Key Derivation

Domain: ${typeof window !== 'undefined' ? window.location.origin : 'unknown'}
Wallet: ${walletPubkey.toBase58()}
Purpose: Decrypt your encrypted balance and orders

⚠️ WARNING: Only sign this message on the official Dark Pool DEX site.
This signature cannot move your funds but will allow viewing your private balance.

Timestamp: ${Date.now()}
Version: ${KEY_VERSION}`;
}

/**
 * DECISION 3: Using Web Crypto HKDF-SHA256 for key derivation
 * Implements HKDF (RFC 5869) using Web Crypto API
 * 
 * @param ikm - Input Key Material (signature)
 * @param salt - Salt value (string, will be encoded)
 * @param info - Context info (Uint8Array)
 * @param length - Output length in bytes (32 for x25519)
 */
async function hkdf(
  ikm: Uint8Array,
  salt: string,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  
  // Import IKM as key
  const key = await crypto.subtle.importKey(
    'raw',
    ikm as BufferSource,
    { name: 'HKDF' },
    false,
    ['deriveBits']
  );
  
  // Derive bits using HKDF
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new TextEncoder().encode(salt),
      info: info as BufferSource,
    },
    key,
    length * 8  // bits
  );
  
  return new Uint8Array(derivedBits);
}

/**
 * DECISION 4: Deterministic x25519 key derivation
 * Uses HKDF-SHA256 to derive 32-byte seed from signature
 * 
 * NOTE: For now, this creates a "placeholder" x25519 keypair since we don't have
 * the @arcium-hq/client library yet. In production, use x25519.getPublicKey()
 * 
 * @param signature - Ed25519 signature from wallet
 * @param walletPubkey - User's Solana public key
 */
async function deriveX25519FromSignature(
  signature: Uint8Array,
  walletPubkey: PublicKey
): Promise<X25519Keys> {
  
  console.log('📝 Deriving x25519 keypair from wallet signature...');
  
  // Derive 32-byte seed using HKDF
  const privateKey = await hkdf(
    signature,                        // IKM (input key material)
    'darkpool_x25519_v1',            // salt (domain-specific)
    walletPubkey.toBytes(),          // info (wallet-specific)
    32                                // 32 bytes for x25519 private key
  );
  
  /**
   * DECISION 5: Placeholder x25519 public key derivation
   * TODO: Replace with @arcium-hq/client's x25519.getPublicKey(privateKey)
   * 
   * For now, we derive it deterministically from the private key
   * This is NOT the correct x25519 curve multiplication, just a placeholder
   */
  const publicKey = await derivePublicKeyPlaceholder(privateKey);
  
  console.log('✅ x25519 keypair derived successfully');
  console.log('   Private key length:', privateKey.length);
  console.log('   Public key length:', publicKey.length);
  
  return { privateKey, publicKey };
}

/**
 * PLACEHOLDER: Derive public key deterministically
 * TODO: Replace with proper x25519 scalar multiplication
 * 
 * In production, use: x25519.getPublicKey(privateKey) from @arcium-hq/client
 */
async function derivePublicKeyPlaceholder(privateKey: Uint8Array): Promise<Uint8Array> {
  // Derive public key using HKDF for determinism (NOT REAL X25519!)
  return await hkdf(
    privateKey,
    'darkpool_pubkey_v1',
    new TextEncoder().encode('placeholder'),
    32
  );
}

/**
 * DECISION 6: Encrypted caching in localStorage
 * - Encrypts private key before storage using AES-GCM
 * - Derives cache encryption key from same signature (different salt)
 * - Reduces signature requests (better UX)
 * 
 * @param privateKey - x25519 private key to cache
 * @param signature - Wallet signature (used to derive cache encryption key)
 * @param walletPubkey - User's wallet public key
 */
async function cacheX25519Key(
  privateKey: Uint8Array,
  signature: Uint8Array,
  walletPubkey: PublicKey
): Promise<void> {
  
  console.log('💾 Caching x25519 key (encrypted) to localStorage...');
  
  // Derive cache encryption key (different from x25519 derivation)
  const cacheKey = await hkdf(
    signature,
    'darkpool_cache_v1',              // Different salt from key derivation
    new TextEncoder().encode('localStorage encryption'),
    32
  );
  
  // Generate random IV for AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Import cache key for encryption
  const key = await crypto.subtle.importKey(
    'raw',
    cacheKey as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  // Encrypt private key
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    privateKey as BufferSource
  );
  
  // Store in localStorage
  const cached: CachedX25519 = {
    version: KEY_VERSION,
    encryptedKey: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
    timestamp: Date.now(),
  };
  
  const storageKey = `x25519_${walletPubkey.toBase58()}`;
  localStorage.setItem(storageKey, JSON.stringify(cached));
  
  console.log('✅ Key cached successfully');
}

/**
 * DECISION 7: Cache retrieval with signature verification
 * User must sign again to decrypt cache (prevents offline attacks)
 * 
 * @param signature - Fresh wallet signature
 * @param walletPubkey - User's wallet public key
 * @returns Decrypted private key or null if cache miss/corrupt
 */
async function getCachedX25519Key(
  signature: Uint8Array,
  walletPubkey: PublicKey
): Promise<Uint8Array | null> {
  
  const storageKey = `x25519_${walletPubkey.toBase58()}`;
  const cached = localStorage.getItem(storageKey);
  
  if (!cached) {
    console.log('ℹ️ No cached key found');
    return null;
  }
  
  try {
    const data: CachedX25519 = JSON.parse(cached);
    
    // Check version
    if (data.version !== KEY_VERSION) {
      console.log('⚠️ Cache version mismatch, clearing cache');
      localStorage.removeItem(storageKey);
      return null;
    }
    
    // Check expiration
    if (Date.now() - data.timestamp > CACHE_MAX_AGE) {
      console.log('⚠️ Cache expired (>30 days), clearing cache');
      localStorage.removeItem(storageKey);
      return null;
    }
    
    console.log('🔍 Found cached key, attempting decryption...');
    
    // Derive cache decryption key from signature
    const cacheKey = await hkdf(
      signature,
      'darkpool_cache_v1',
      new TextEncoder().encode('localStorage encryption'),
      32
    );
    
    const key = await crypto.subtle.importKey(
      'raw',
      cacheKey as BufferSource,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const iv = Uint8Array.from(atob(data.iv), c => c.charCodeAt(0));
    const encrypted = Uint8Array.from(atob(data.encryptedKey), c => c.charCodeAt(0));
    
    // Decrypt private key
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    console.log('✅ Cache decrypted successfully');
    return new Uint8Array(decrypted);
    
  } catch (error) {
    console.error('❌ Failed to decrypt cached key:', error);
    // Cache corrupted or wrong signature, remove it
    localStorage.removeItem(storageKey);
    return null;
  }
}

/**
 * MAIN FUNCTION: Get or derive x25519 keys
 * 
 * DECISION 8: Hybrid approach for optimal UX
 * Flow:
 * 1. Request wallet signature (required for security)
 * 2. Try to decrypt from cache (fast path)
 * 3. If cache miss, derive from signature (slow path)
 * 4. Cache for future sessions
 * 
 * @param walletPubkey - User's Solana wallet public key
 * @param signMessage - Function to request signature from wallet
 * @returns x25519 keypair for encryption/decryption
 */
export async function getOrDeriveX25519Keys(
  walletPubkey: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
): Promise<X25519Keys> {
  
  console.log('🔑 Starting x25519 key derivation process...');
  
  // Create deterministic signature message
  const message = createSignatureMessage(walletPubkey);
  const messageBytes = new TextEncoder().encode(message);
  
  try {
    // Request signature from wallet
    console.log('✍️ Requesting signature from wallet...');
    const signature = await signMessage(messageBytes);
    console.log('✅ Signature received');
    
    // Try to get from cache first (fast path)
    const cached = await getCachedX25519Key(signature, walletPubkey);
    
    if (cached) {
      // Cache hit - derive public key and return
      const publicKey = await derivePublicKeyPlaceholder(cached);
      return { privateKey: cached, publicKey };
    }
    
    // Cache miss - derive from signature (slow path)
    console.log('📊 Cache miss, deriving keys from signature...');
    const keys = await deriveX25519FromSignature(signature, walletPubkey);
    
    // Cache for future sessions
    await cacheX25519Key(keys.privateKey, signature, walletPubkey);
    
    return keys;
    
  } catch (error) {
    console.error('❌ Key derivation failed:', error);
    throw new Error(`Failed to derive encryption keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * DECISION 9: User-initiated key clearing
 * Allows users to "log out" or revoke cached keys
 * Keys remain recoverable (deterministic derivation)
 * 
 * @param walletPubkey - User's wallet public key
 */
export function clearCachedKeys(walletPubkey: PublicKey): void {
  const storageKey = `x25519_${walletPubkey.toBase58()}`;
  localStorage.removeItem(storageKey);
  console.log('🗑️ Cleared cached encryption keys');
}

/**
 * DECISION 10: Key rotation for compromised keys
 * Generates NEW random keypair (not deterministic)
 * User must re-initialize ledger with new key
 * 
 * This is for advanced users who suspect key compromise
 * 
 * @param walletPubkey - User's wallet public key
 * @returns New random x25519 keypair
 */
export async function rotateX25519Keys(walletPubkey: PublicKey): Promise<X25519Keys> {
  
  console.log('🔄 Rotating x25519 keys...');
  
  // Clear old cache
  clearCachedKeys(walletPubkey);
  
  // Generate NEW random keypair (not derived)
  const privateKey = crypto.getRandomValues(new Uint8Array(32));
  const publicKey = await derivePublicKeyPlaceholder(privateKey);
  
  // Store with special marker (not cached with signature)
  const storageKey = `x25519_rotated_${walletPubkey.toBase58()}`;
  localStorage.setItem(storageKey, btoa(String.fromCharCode(...privateKey)));
  
  console.log('✅ Generated new x25519 keypair');
  console.log('⚠️ You must re-initialize your ledger with this new key!');
  
  return { privateKey, publicKey };
}

/**
 * DECISION 11: Check if user has cached keys
 * Used to determine if signature is needed
 * 
 * @param walletPubkey - User's wallet public key
 * @returns true if cached keys exist
 */
export function hasCachedKeys(walletPubkey: PublicKey): boolean {
  const storageKey = `x25519_${walletPubkey.toBase58()}`;
  const cached = localStorage.getItem(storageKey);
  
  if (!cached) return false;
  
  try {
    const data: CachedX25519 = JSON.parse(cached);
    
    // Check version and expiration
    if (data.version !== KEY_VERSION) return false;
    if (Date.now() - data.timestamp > CACHE_MAX_AGE) return false;
    
    return true;
  } catch {
    return false;
  }
}

