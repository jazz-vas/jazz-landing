import forge from 'node-forge';
import { config } from './config';

/**
 * Encrypts a string using RSA public key encryption
 * @param text - The text to encrypt
 * @returns The encrypted text as a base64 string
 */
export function encrypt(text: string): string {
  try {
    const publicKeyPem = config.rsaPublicKey;
    
    if (!publicKeyPem) {
      throw new Error('RSA public key not configured');
    }

    // Parse the public key
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    
    // Encrypt the text
    const encrypted = publicKey.encrypt(text, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: {
        md: forge.md.sha256.create()
      }
    });
    
    // Convert to base64
    return forge.util.encode64(encrypted);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Note: Decryption is not available in this app.
 * Decryption will be performed by the HTTPS app using the private key.
 */
