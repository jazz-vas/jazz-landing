/**
 * GA4 Client ID Extraction Utility
 * Uses gtag to retrieve the GA4 client ID
 * With @next/third-parties, gtag is loaded asynchronously after page render
 */

const GA4_MEASUREMENT_ID = 'G-7H51N4FGGD';

export const getGA4ClientId = (): Promise<string | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }

    if ((window as any).gtag) {
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
 * Helper function with retry logic - waits for gtag to be available
 * Useful when called immediately after page load
 * @param retries - Number of retry attempts (default: 3)
 * @param delayMs - Delay between retries in milliseconds (default: 150ms)
 */
export const getGA4ClientIdAsync = async (retries: number = 3, delayMs: number = 150): Promise<string | null> => {
  for (let i = 0; i < retries; i++) {
    const clientId = await getGA4ClientId();
    if (clientId) {
      console.log('[GA4] Successfully obtained client ID on attempt', i + 1);
      return clientId;
    }
    // Wait before retrying
    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  console.warn('[GA4] Failed to get client ID after', retries, 'attempts');
  return null;
};
