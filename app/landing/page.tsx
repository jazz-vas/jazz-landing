import { redirect } from 'next/navigation';
import { getClientConfig } from '@/lib/config';
import { ERROR_MESSAGES } from '@/lib/constants';
import { decrypt } from '@/lib/encryption';
import LandingClient from './LandingClient';

interface PageProps {
  searchParams: Promise<{
    campaignInfo?: string;
    campaignRedisKey?: string;
    productName: string;
    utm_campaign?: string;
    // Click ID parameters from ad platforms
    gclid?: string;      // Google Ads Click ID
    gbraid?: string;     // Google Ads (iOS 14.5+ Web-to-App)
    wbraid?: string;     // Google Ads (iOS 14.5+ App-to-Web)
    ttclid?: string;     // TikTok Click ID
    fbclid?: string;     // Facebook Click ID
    msclkid?: string;    // Microsoft Ads Click ID
    click_id?: string;   // Generic Click ID
    // UTM parameters for campaign tracking
    utm_source?: string;   // Traffic source
    utm_medium?: string;   // Marketing medium
    utm_content?: string;  // Ad content/variation
    utm_term?: string;     // Search term
  }>;
}

interface CampaignData {
  variantName: string;
  partnerId: number;
  campaignName: string;
}

export default async function LandingPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Validate productName is provided
  if (!params.productName) {
    throw new Error('productName is required');
  }

  // Check for either campaignInfo or campaignRedisKey parameter
  if (!params.campaignInfo && !params.campaignRedisKey) {
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
              <p className="text-gray-600">Missing required parameter: campaignInfo or campaignRedisKey</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  let campaignData: CampaignData | null = null;

  // Handle campaignInfo flow (decrypt and parse)
  if (params.campaignInfo) {
    const secretKey = process.env.ENCRYPTION_SECRET_KEY;
    if (!secretKey) {
      throw new Error('ENCRYPTION_SECRET_KEY is not configured');
    }

    const decryptedData = decrypt(params.campaignInfo, secretKey);

    if (!decryptedData) {
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Decryption Error</h1>
                <p className="text-gray-600">Failed to decrypt campaign information</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    try {
      campaignData = JSON.parse(decryptedData);
    } catch (error) {
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Data</h1>
                <p className="text-gray-600">Campaign information is malformed</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!campaignData) {
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Data</h1>
                <p className="text-gray-600">Campaign data is missing</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const { variantName, partnerId, campaignName } = campaignData;
    console.log('Campaign Data:', campaignData);

    if (!variantName || partnerId === undefined || !campaignName) {
      console.log('Incomplete campaign data:', campaignData);
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Data</h1>
                <p className="text-gray-600">Missing required campaign fields</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }



  // Get server-side config (has access to env variables)
  const config = getClientConfig();

  // Extract campaign fields if campaignInfo was provided
  const variantName = campaignData?.variantName;
  const partnerId = campaignData?.partnerId;
  const campaignName = campaignData?.campaignName;

  // Extract tracking parameters
  const trackingParams = {
    gclid: params.gclid,
    gbraid: params.gbraid,
    wbraid: params.wbraid,
    ttclid: params.ttclid,
    fbclid: params.fbclid,
    msclkid: params.msclkid,
    click_id: params.click_id,
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    utm_content: params.utm_content,
    utm_term: params.utm_term,
  };

  // Pass config and campaign data to client component
  // Only pass variant/partnerRef/utm_campaign if they came from campaignInfo (not campaignRedisKey)
  return (
    <LandingClient
      config={config}
      productName={params.productName}
      variant={params.campaignInfo ? variantName : undefined}
      partnerRef={params.campaignInfo ? partnerId?.toString() : undefined}
      utm_campaign={params.campaignInfo ? campaignName : undefined}
      campaignRedisKey={params.campaignRedisKey || null}
      trackingParams={trackingParams}
    />
  );
}
