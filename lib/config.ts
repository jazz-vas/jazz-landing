/**
 * Server-side configuration
 * These values are injected at runtime and are NOT exposed to the client
 */

export const config = {
  msisdnApiUrl: process.env.MSISDN_API_URL || 'http://jazzred-cms-stg.jazz.com.pk/jazz/v1/api/proxy/msisdn',
  httpsAppUrl: process.env.HTTPS_APP_URL || 'https://localhost:3000',
  rsaPublicKey: process.env.RSA_PUBLIC_KEY || '',
};

/**
 * Client-safe configuration
 * Only expose what's absolutely necessary for the client
 */
export function getClientConfig() {
  return {
    httpsAppUrl: config.httpsAppUrl,
    msisdnApiUrl: config.msisdnApiUrl,
  };
}
