/**
 * Server-side configuration
 * These values are injected at runtime and are NOT exposed to the client
 */

// Validate critical config at module load time
const encryptionSecretKey = process.env.ENCRYPTION_SECRET_KEY || '';
if (!encryptionSecretKey) {
  throw new Error('ENCRYPTION_SECRET_KEY environment variable is required');
}

export const config = {
  msisdnApiUrl: process.env.MSISDN_API_URL || 'http://jazzred-cms-stg.jazz.com.pk/jazz/v1/api/proxy/msisdn',
  httpsAppUrl: process.env.HTTPS_APP_URL || 'https://jazzred-cms-stg.jazz.com.pk',
  encryptionSecretKey,
};

/**
 * Client-safe configuration
 * Only expose what's absolutely necessary for the client
 * DO NOT include encryption key or sensitive URLs
 */
export function getClientConfig() {
  return {
    httpsAppUrl: config.httpsAppUrl,
  };
}
