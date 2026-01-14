'use client';

import { useEffect, useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { getGA4ClientIdAsync } from '@/lib/ga4Client';
import { API_TIMEOUT_MS, ERROR_MESSAGES } from '@/lib/constants';

interface ProcessResponse {
  success: boolean;
  data?: {
    encryptedMsisdn?: string;
    encryptedFlag?: string;
    httpsAppUrl: string;
  };
  message?: string;
}

/**
 * Validates clientId parameter format
 */
function isValidClientId(clientId: string): boolean {
  // Alphanumeric, hyphens, underscores - up to 256 chars
  return /^[a-zA-Z0-9_-]{1,256}$/.test(clientId);
}

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get clientId from URL params
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get('clientId');
    
    if (!clientId) {
      setError(ERROR_MESSAGES.MISSING_CLIENT_ID);
      setIsLoading(false);
      return;
    }

    if (!isValidClientId(clientId)) {
      setError(ERROR_MESSAGES.INVALID_CLIENT_ID);
      setIsLoading(false);
      return;
    }
    
    // Single unified call to /api/process endpoint
    // This handles: config fetching, MSISDN fetching, and encryption server-side
    const processAndRedirect = async () => {
      try {
        // Get GA4 client ID with retry logic (waits for gtag to load)
        const gaClientId = await getGA4ClientIdAsync();
        console.log('[INFO] GA4 Client ID obtained:', gaClientId ? 'yes' : 'no');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

        // Build headers
        const headers: HeadersInit = {};
        if (gaClientId) {
          headers['ga-client-id'] = gaClientId;
        }

        const processResponse = await fetch(`/api/process?clientId=${encodeURIComponent(clientId)}`, {
          signal: controller.signal,
          headers,
        });

        clearTimeout(timeoutId);

        if (!processResponse.ok) {
          setError('Failed to process request. Please try again.');
          setIsLoading(false);
          return;
        }

        const result: ProcessResponse = await processResponse.json();

        if (!result.success || !result.data) {
          setError(result.message || 'Failed to process request');
          setIsLoading(false);
          return;
        }

        // Build redirect URL with encrypted data
        redirectToApp(clientId, result.data);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error 
          ? (err.name === 'AbortError' ? 'Request timeout' : 'Network error')
          : 'Unknown error occurred';
        
        if (process.env.NODE_ENV === 'development') {
          console.error('[DEBUG] Process error:', err);
        }

        setError(errorMsg);
        setIsLoading(false);
      }
    };
    
    processAndRedirect();
  }, []);

  const redirectToApp = (
    clientId: string, 
    data: { encryptedMsisdn?: string; encryptedFlag?: string; httpsAppUrl: string }
  ): void => {
    try {
      const url = new URL(data.httpsAppUrl);
      url.searchParams.set('clientId', clientId);
      
      if (data.encryptedMsisdn) {
        url.searchParams.set('msisdn', data.encryptedMsisdn);
      }
      
      if (data.encryptedFlag) {
        url.searchParams.set('originateFromLanding', data.encryptedFlag);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[DEBUG] Redirecting to app');
      }

      window.location.href = url.toString();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[DEBUG] Redirect error:', err);
      }
      setError('Failed to redirect. Please contact support.');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-red-100 p-4 rounded-full">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Error</h1>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <LoadingScreen />;
}
