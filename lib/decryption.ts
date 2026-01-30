import crypto from 'crypto';

export function decryptMsisdn(encryptedMsisdn: string, encryptionKey: string): string | null {
  try {
    const algorithm = 'aes-256-ecb';
    const keyBuffer = Buffer.from(encryptionKey, 'utf8');

    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, null);

    // Disable auto padding to prevent "bad decrypt" errors
    decipher.setAutoPadding(false);

    let decrypted = decipher.update(encryptedMsisdn, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    // Manually clean up any hidden padding characters (null bytes, etc.)
    // This regex removes non-printable characters often left by padding
    const cleaned = decrypted.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

    return cleaned;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

export function isValidMsisdn(msisdn: string): boolean {
  // Check if msisdn starts with '92'
  return msisdn.startsWith('92');
}
