/**
 * Server-side configuration
 * These values are injected at runtime and are NOT exposed to the client
 * All configuration is internal to the server - no API endpoint exposes these directly
 */

// Validate critical config at module load time
const encryptionSecretKey = process.env.ENCRYPTION_SECRET_KEY || '';
console.log('[INFO] Loaded server configuration');
console.log('[INFO] MSISDN_API_URL:', process.env.MSISDN_API_URL);
console.log('[INFO] HTTPS_APP_URL:', process.env.HTTPS_APP_URL);
console.log('[INFO] ENCRYPTION_SECRET_KEY set:', process.env.ENCRYPTION_SECRET_KEY);
if (!encryptionSecretKey) {
  throw new Error('ENCRYPTION_SECRET_KEY environment variable is required');
}

export const config = {
  msisdnApiUrl: process.env.MSISDN_API_URL || 'http://jazzred-cms-stg.jazz.com.pk/jazz/v1/api/proxy/msisdn',
  httpsAppUrl: process.env.HTTPS_APP_URL || 'https://jazzred-cms-stg.jazz.com.pk',
  encryptionSecretKey,
};
