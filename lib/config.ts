/**
 * Server-side configuration
 * These values are injected at runtime and are NOT exposed to the client
 */

export const config = {
  msisdnApiUrl: process.env.MSISDN_API_URL || '',
  httpsAppUrl: process.env.HTTPS_APP_URL || '',
  encryptionSecretKey: process.env.ENCRYPTION_SECRET_KEY || '',
  appBaseUrl: process.env.APP_BASE_URL || '',
};

/**
 * Client-safe configuration
 * Only expose what's absolutely necessary for the client
 */
export function getClientConfig() {
  return {
    httpsAppUrl: config.httpsAppUrl,
    msisdnApiUrl: config.msisdnApiUrl,
    appBaseUrl: config.appBaseUrl,
  };
}
