'use client';

import { useEffect, useState } from 'react';
import LoadingScreen from '../components/LoadingScreen'
import { getGA4ClientIdAsync } from '@/lib/ga4Client'
import { API_TIMEOUT_MS, ERROR_MESSAGES } from '@/lib/constants'

interface ClientConfig {
  httpsAppUrl: string;
  msisdnApiUrl: string;
}

interface EncryptResponse {
  success: boolean;
  data?: {
    encryptedMsisdn?: string;
    encryptedFlag?: string;
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

    // if (!isValidClientId(clientId)) {
    //   setError(ERROR_MESSAGES.INVALID_CLIENT_ID);
    //   setIsLoading(false);
    //   return;
    // }

    // Three-step process: 1) Get config, 2) Fetch MSISDN client-side, 3) Encrypt server-side
    const processAndRedirect = async () => {
      try {
        // Step 1: Get client configuration
        const configResponse = await fetch('/api/config');
        if (!configResponse.ok) {
          throw new Error('Failed to fetch configuration');
        }
        const config: ClientConfig = await configResponse.json();

        // Get GA4 client ID with retry logic (waits for gtag to load)
        const gaClientId = await getGA4ClientIdAsync();

        // Step 2: Fetch MSISDN from external API (client-side)
        let msisdn: string | null = null;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

          // Build headers for MSISDN API request
          const msisdnHeaders: HeadersInit = {
            'Accept': 'application/json',
          };

          // Include GA4 client ID if available
          if (gaClientId) {
            msisdnHeaders['ga-client-id'] = gaClientId;
          }

          console.log("configuratuon",config)

          const msisdnResponse = await fetch(config!.msisdnApiUrl, {
            signal: controller.signal,
            headers: msisdnHeaders,
          });

          clearTimeout(timeoutId);

          if (msisdnResponse.ok) {
            const msisdnData = await msisdnResponse.json();
            // Handle external API response structure
            msisdn = msisdnData?.data || msisdnData?.msisdn || null;
          }
        } catch (msisdnErr) {
          // Continue without MSISDN - not a critical failure
        }

        // Step 3: Send raw MSISDN and landing flag to server for encryption
        const encryptResponse = await fetch('/api/msisdn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            msisdn: msisdn,
            originateFromLanding: 'true'
          }),
        });

        const encryptResult: EncryptResponse = await encryptResponse.json();

        if (!encryptResult.success || !encryptResult.data) {
          // Redirect without encrypted data if encryption fails
          redirectToApp(clientId, null, null, config.httpsAppUrl);
          return;
        }

        // Redirect with server-encrypted data
        redirectToApp(
          clientId,
          encryptResult.data.encryptedMsisdn || null,
          encryptResult.data.encryptedFlag || null,
          config.httpsAppUrl
        );
      } catch (err: unknown) {
        // Show error if config fetch or any critical step fails
        setError('Failed to load configuration. Please try again later.');
        setIsLoading(false);
      }
    };

    processAndRedirect();
  }, []);

  const redirectToApp = (
    clientId: string,
    encryptedMsisdn: string | null,
    encryptedFlag: string | null,
    httpsAppUrl: string
  ): void => {
    const url = new URL(httpsAppUrl);
    url.searchParams.set('clientId', clientId);

    if (encryptedMsisdn) {
      url.searchParams.set('msisdn', encryptedMsisdn);
    }

    if (encryptedFlag) {
      url.searchParams.set('originateFromLanding', encryptedFlag);
    }

    // window.location.href = url.toString();
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
