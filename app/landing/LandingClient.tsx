'use client';

import { useEffect, useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { API_TIMEOUT_MS, ERROR_MESSAGES } from '@/lib/constants';

interface LandingClientProps {
  config: {
    httpsAppUrl: string;
    msisdnApiUrl: string;
    appBaseUrl: string;
  };
  productName: string;
  variant?: string;
  partnerRef?: string;
  utm_campaign?: string;
}

interface EncryptResponse {
  success: boolean;
  data?: {
    encryptedMsisdn?: string;
    encryptedFlag?: string;
  };
  message?: string;
}

export default function LandingClient({ config, productName, variant, partnerRef, utm_campaign }: LandingClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("testing123")
    const processAndRedirect = async () => {
      try {
        // Step 1: Fetch MSISDN from external API (client-side)
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

          // Build headers for MSISDN API request
          const msisdnHeaders: HeadersInit = {
            'Accept': 'application/json',
          };

          const msisdnUrl = new URL(config.msisdnApiUrl);

          console.log('Configuration:', config);

          // Build info endpoint URL
          const infoUrl = new URL(`${config.appBaseUrl}/api/landing/info`);
          
          // Only add campaign params if they are provided
          if (variant && partnerRef && utm_campaign) {
            infoUrl.searchParams.set('variant', variant);
            infoUrl.searchParams.set('partnerRef', partnerRef);
            infoUrl.searchParams.set('utm_campaign', utm_campaign);
          }

          const msisdnResponse = await fetch(infoUrl.toString(), {
            method: 'GET',
            signal: controller.signal,
            headers: msisdnHeaders,
          });

          clearTimeout(timeoutId);

          if (msisdnResponse.ok) {
            const msisdnData = await msisdnResponse.json();
            // Extract campaign data key, redis key, and encrypted flag from response

            // Redirect with campaign data key, redis key and encrypted flag
            redirectToApp(
              productName,
              msisdnData?.campaignDataKey || null,
              msisdnData?.redisKey || null,
              msisdnData?.originateFromLanding || null,
              config.httpsAppUrl
            );
            return;
          }
        } catch (msisdnErr) {
          // Continue without MSISDN - not a critical failure
          console.warn('MSISDN fetch failed:', msisdnErr);
        }

        // If no msisdn from info endpoint, redirect without it
        redirectToApp(productName, null, null, null, config.httpsAppUrl);
      } catch (err: unknown) {
        // Show error if any critical step fails
        console.error('Landing error:', err);
        setError('Failed to load configuration. Please try again later.');
        setIsLoading(false);
      }
    };

    processAndRedirect();
  }, [config, productName, variant, partnerRef, utm_campaign]);

  const redirectToApp = (
    productName: string,
    campaignDataKey: string | null,
    encryptedRedisKey: string | null,
    encryptedFlag: string | null,
    httpsAppUrl: string
  ): void => {
    const url = new URL(`/signin/${productName}`, httpsAppUrl);

    if (campaignDataKey) {
      url.searchParams.set('campaignDataKey', campaignDataKey);
    }

    if (encryptedRedisKey) {
      url.searchParams.set('redisKey', encryptedRedisKey);
    }

    if (encryptedFlag) {
      url.searchParams.set('originateFromLanding', encryptedFlag);
    }

    console.log("Redirecting to:", url.toString());

    window.location.href = url.toString();
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
