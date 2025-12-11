import crypto from 'crypto';

/**
 * Encrypts a string using RSA public key encryption
 * @param text - The text to encrypt
 * @param publicKeyPem - The RSA public key in PEM format
 * @returns The encrypted text as a base64 string
 */
export function encrypt(text: string, publicKeyPem: string): string {
  try {
    if (!publicKeyPem) {
      throw new Error('RSA public key not configured');
    }

    // Encrypt using RSA-OAEP with SHA-256
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(text, 'utf8')
    );
    
    // Convert to base64
    return encrypted.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Note: Decryption is not available in this app.
 * Decryption will be performed by the HTTPS app using the private key.
 */
