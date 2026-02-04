/**
 * AES-256-GCM Symmetric Encryption for HTTP Landing Page
 * Copy this file to your jazz-landing project
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Encrypts data using AES-256-GCM symmetric encryption
 * @param plaintext - The text to encrypt (e.g., "923086094856")
 * @param secretKey - Base64 encoded secret key from .env (ENCRYPTION_SECRET_KEY)
 * @returns URL-safe base64 encoded encrypted data
 */
export function encrypt(plaintext: string, secretKey: string): string {
  try {
    // Decode the secret key from base64
    const key = Buffer.from(secretKey, 'base64');
    
    if (key.length !== KEY_LENGTH) {
      throw new Error(`Secret key must be ${KEY_LENGTH} bytes (got ${key.length})`);
    }

    // Generate random IV (Initialization Vector)
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the data
    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    // Combine IV + encrypted data + auth tag
    const combined = Buffer.concat([iv, encrypted, authTag]);
    
    // Convert to URL-safe base64 (no +/= characters)
    const base64 = combined.toString('base64');
    const urlSafeBase64 = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '~');
    
    // Only log in development to avoid exposing data in production logs
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [HTTP] Encrypted successfully');
      console.log('   Output length:', urlSafeBase64.length);
    }
    
    return urlSafeBase64;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ [HTTP] Encryption failed:', errorMessage);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypts data using AES-256-GCM
 * @param encryptedData - URL-safe base64 encoded encrypted data
 * @param secretKey - 32-byte (256-bit) secret key as base64 string
 * @returns Decrypted plaintext or null if decryption fails
 */
export function decrypt(encryptedData: string, secretKey: string): string | null {
  try {
    // Decode the secret key from base64
    const key = Buffer.from(secretKey, 'base64');
    
    if (key.length !== KEY_LENGTH) {
      return null;
    }

    // Convert URL-safe base64 back to standard base64
    const standardBase64 = encryptedData
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .replace(/~/g, '=');
    
    // Decode from base64
    const combined = Buffer.from(standardBase64, 'base64');
    
    // Extract IV, encrypted data, and auth tag
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH, combined.length - AUTH_TAG_LENGTH);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error: any) {
    console.error('❌ [HTTP] Decryption failed:', error.message);
    return null;
  }
}

// Example usage in your redirect function:
/*
const secretKey = process.env.ENCRYPTION_SECRET_KEY!;

const redirectToApp = (clientId: string, msisdn: string, httpsAppUrl: string) => {
  // Encrypt MSISDN
  const encryptedMsisdn = encryptData(msisdn, secretKey);
  
  // Encrypt landing origin flag
  const encryptedFlag = encryptData('true', secretKey);
  
  // Build URL
  const url = new URL(httpsAppUrl);
  url.searchParams.set('clientId', clientId);
  url.searchParams.set('msisdn', encryptedMsisdn);
  url.searchParams.set('originateFromLanding', encryptedFlag);
  
  console.log('🚀 Redirecting to:', url.toString());
  window.location.href = url.toString();
};
*/
