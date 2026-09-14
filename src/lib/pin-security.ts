/**
 * ScrapItBro Local PIN Security Module
 * 
 * Provides client-side, device-local cryptographic PIN protection using the Web Crypto API:
 * - PBKDF2 with SHA-256 and 100,000 iterations for key derivation
 * - AES-GCM 256-bit encryption for canary authentication
 * - Never stores plaintext PIN or raw key material anywhere
 * - Local to this browser profile on this device
 */

const PIN_STORAGE_KEY = 'photovault:pin_auth';
const CANARY_PAYLOAD = 'ScrapItBro::VaultAuth::v1';
const PBKDF2_ITERATIONS = 100000;

interface PinAuthConfig {
  salt: string; // hex
  iv: string;   // hex
  ciphertext: string; // hex
  createdAt: string;
}

function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Derive AES-GCM 256-bit key from PIN and salt using PBKDF2 (100k rounds)
 */
async function deriveKeyFromPin(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const pinBuffer = encoder.encode(pin);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    pinBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Check if a PIN has been set up on this device
 */
export function isPinConfigured(): boolean {
  try {
    const raw = localStorage.getItem(PIN_STORAGE_KEY);
    if (!raw) return false;
    const config: PinAuthConfig = JSON.parse(raw);
    return Boolean(config.salt && config.iv && config.ciphertext);
  } catch {
    return false;
  }
}

/**
 * Configure a new PIN
 */
export async function setupPin(pin: string): Promise<boolean> {
  if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
    throw new Error('PIN must be 4 to 6 numeric digits');
  }

  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKeyFromPin(pin, salt);

    const encoder = new TextEncoder();
    const canaryBuffer = encoder.encode(CANARY_PAYLOAD);

    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as unknown as BufferSource },
      key,
      canaryBuffer
    );

    const config: PinAuthConfig = {
      salt: bufferToHex(salt),
      iv: bufferToHex(iv),
      ciphertext: bufferToHex(ciphertextBuffer),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('[PIN Security] Failed to setup PIN:', error);
    return false;
  }
}

/**
 * Verify a PIN against stored cryptographic canary
 */
export async function verifyPin(pin: string): Promise<boolean> {
  if (!pin || !isPinConfigured()) return false;

  try {
    const raw = localStorage.getItem(PIN_STORAGE_KEY);
    if (!raw) return false;
    const config: PinAuthConfig = JSON.parse(raw);

    const salt = hexToBuffer(config.salt);
    const iv = hexToBuffer(config.iv);
    const ciphertext = hexToBuffer(config.ciphertext);

    const key = await deriveKeyFromPin(pin, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as unknown as BufferSource },
      key,
      ciphertext as unknown as BufferSource
    );

    const decoder = new TextDecoder();
    const decryptedText = decoder.decode(decryptedBuffer);

    return decryptedText === CANARY_PAYLOAD;
  } catch {
    // Decryption fails when key is invalid (wrong PIN)
    return false;
  }
}

/**
 * Change the existing PIN to a new PIN
 */
export async function changePin(oldPin: string, newPin: string): Promise<boolean> {
  const isValid = await verifyPin(oldPin);
  if (!isValid) {
    return false;
  }
  return setupPin(newPin);
}

/**
 * Disable PIN protection after verifying current PIN
 */
export async function disablePin(currentPin: string): Promise<boolean> {
  const isValid = await verifyPin(currentPin);
  if (!isValid) {
    return false;
  }
  localStorage.removeItem(PIN_STORAGE_KEY);
  return true;
}

/**
 * Remove PIN config without verification (used when resetting vault)
 */
export function removePinConfig(): void {
  localStorage.removeItem(PIN_STORAGE_KEY);
}
