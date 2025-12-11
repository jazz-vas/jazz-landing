'use client';

import { useEffect, useState } from 'react';

interface ClientConfig {
  httpsAppUrl: string;
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
        
        // Fetch encrypted MSISDN from our API route
        const msisdnResponse = await fetch('/api/msisdn');
        const result = await msisdnResponse.json();
        
        if (!result.success || !result.data) {
          // Redirect without MSISDN if fetch fails
          redirectToApp(id, null, config.httpsAppUrl);
          return;
        }
        
        // Redirect with encrypted MSISDN
        redirectToApp(id, result.data, config.httpsAppUrl);
      } catch (err) {
        console.error('Error in fetchAndRedirect:', err);
        // Redirect without MSISDN on error
        // Fallback to default URL if config fetch failed
        redirectToApp(id, null, 'https://localhost:3000');
      }
    };
    
    fetchAndRedirect();
  }, []);

  const redirectToApp = (clientId: string, encryptedMsisdn: string | null, httpsAppUrl: string) => {
    // Build hash parameters
    const hashParams = new URLSearchParams();
    hashParams.set('originateFromLanding', 'true');
    
    if (encryptedMsisdn) {
      hashParams.set('msisdn', encryptedMsisdn);
    }
    
    // Build final URL
    const redirectUrl = `${httpsAppUrl}?clientId=${clientId}#${hashParams.toString()}`;
    
    console.log('Redirecting to:', redirectUrl);
    window.location.href = redirectUrl;
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Jazz Logo */}
          <div className="relative w-32 h-16">
            <img
              src="/jazz-logo.webp"
              alt="Jazz Logo"
              className="object-contain w-full h-full"
            />
          </div>
          
          {/* Loading Animation */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          </div>
          
          {/* Loading Text */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
            <p className="text-gray-600">Please wait while we verify your connection</p>
          </div>
          
          {/* Progress Indicator */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-red-600 to-orange-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
