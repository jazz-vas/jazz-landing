/**
 * GA4 Client ID Extraction Utility
 * Uses gtag to retrieve the GA4 client ID
 */

const GA4_MEASUREMENT_ID = 'G-7H51N4FGGD';

export const getGA4ClientId = (): Promise<string | null> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      try {
        (window as any).gtag('get', GA4_MEASUREMENT_ID, 'client_id', (clientId: string) => {
          console.log('✅ [GA4] Client ID retrieved:', clientId);
          resolve(clientId || null);
        });
      } catch (error) {
        console.error('❌ [GA4] Error getting client_id:', error);
        resolve(null);
      }
    } else {
      console.warn('⚠️ [GA4] gtag not available');
      resolve(null);
    }
  });
};

/**
 * Helper function to get GA4 Client ID and handle async usage
 * Usage:
 * const clientId = await getGA4ClientIdAsync();
 */
export const getGA4ClientIdAsync = async (): Promise<string | null> => {
  return getGA4ClientId();
};
