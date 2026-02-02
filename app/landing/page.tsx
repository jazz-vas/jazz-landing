import { redirect } from 'next/navigation';
import { getClientConfig } from '@/lib/config';
import { ERROR_MESSAGES } from '@/lib/constants';
import LandingClient from './LandingClient';

interface PageProps {
  searchParams: Promise<{
    productName?: string;
    variant?: string;
    ref?: string;
    utm_campaign?: string;
  }>;
}

const REQUIRED_PARAMS = ['productName', 'variant', 'ref', 'utm_campaign'];

export default async function LandingPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Server-side validation - check for all required parameters
  const missingParams = REQUIRED_PARAMS.filter(param => !params[param as keyof typeof params]);

  if (missingParams.length > 0) {
    // Return error UI for missing parameters
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
              <p className="text-gray-600">Missing required parameters: {missingParams.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get server-side config (has access to env variables)
  const config = getClientConfig();

  // Pass config and params to client component
  return (
    <LandingClient
      config={config}
      productName={params.productName!}
      variant={params.variant!}
      partnerRef={params.ref!}
      utm_campaign={params.utm_campaign!}
    />
  );
}
