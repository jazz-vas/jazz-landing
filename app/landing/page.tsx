'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';
import { getGA4ClientIdAsync } from '@/lib/ga4Client';

interface ClientConfig {
  httpsAppUrl: string;
  msisdnApiUrl: string;
}

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    // Get clientId from URL params
    const params = new URLSearchParams(window.location.search);
    const id = params.get('clientId');

    if (!id) {
      setError('Missing clientId parameter');
      setIsLoading(false);
      return;
    }

    setClientId(id);

    // Fetch MSISDN and redirect
    const fetchAndRedirect = async () => {
      try {
        // First, get the client configuration
        const configResponse = await fetch('/api/config');
        const config: ClientConfig = await configResponse.json();

        // Get GA4 client ID with retry logic (waits for gtag to load)
        const gaClientId = await getGA4ClientIdAsync();
        console.log('[INFO] GA4 Client ID obtained:', gaClientId ? 'yes' : 'no');

        // Build headers for MSISDN API request
        const msisdnHeaders: Record<string, string> = {
          'Accept': 'application/json',
        };

        // Include GA4 client ID if available
        if (gaClientId) {
          msisdnHeaders['ga-client-id'] = gaClientId;
        }

        // Fetch MSISDN directly from the backend endpoint (client-side)
        const msisdnResponse = await axios.get(config.msisdnApiUrl, {
          timeout: 10000,
          headers: msisdnHeaders,
        });

        console.log("msisdnResponse:", msisdnResponse.data);

        // Send raw MSISDN (if available) and landing flag to server proxy for encryption
        // This prevents MITM attacks - only our server can create valid encrypted data
        const encryptResponse = await fetch('/api/msisdn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            msisdn: msisdnResponse.data?.success && msisdnResponse.data?.data ? msisdnResponse.data.data : null,
            originateFromLanding: 'true'
          }),
        });

        const encryptResult = await encryptResponse.json();

        if (!encryptResult.success || !encryptResult.data) {
          // Redirect without encrypted data if encryption fails
          redirectToApp(id, null, null, config.httpsAppUrl);
          return;
        }

        // Redirect with server-encrypted data
        redirectToApp(
          id,
          encryptResult.data.encryptedMsisdn,
          encryptResult.data.encryptedFlag,
          config.httpsAppUrl
        );
      } catch (err) {
        console.error('Error in fetchAndRedirect:', err);
        // Redirect without MSISDN on error
        // Fallback to default URL if config fetch failed
        redirectToApp(id, null, null, "https://jazzred-cms-stg.jazz.com.pk");
      }
    };

    fetchAndRedirect();
  }, []);

  const redirectToApp = (clientId: string, encryptedMsisdn: string | null, encryptedFlag: string | null, httpsAppUrl: string) => {
    // Build URL with all parameters as query params
    const url = new URL(httpsAppUrl);
    url.searchParams.set('clientId', clientId);

    if (encryptedMsisdn) {
      console.log('🚀 Encrypted MSISDN:', encryptedMsisdn);
      url.searchParams.set('msisdn', encryptedMsisdn);
    }

    if (encryptedFlag) {
      console.log('🚀 Encrypted Landing Flag:', encryptedFlag);
      url.searchParams.set('originateFromLanding', encryptedFlag);
    }

    console.log('🚀 Redirecting to:', url.toString());
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
