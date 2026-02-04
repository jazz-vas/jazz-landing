import { NextRequest, NextResponse } from 'next/server';
import { decryptMsisdn, isValidMsisdn } from '@/lib/decryption';
import { storeDecryptedMsisdn, storeCampaignData } from '@/lib/redis';
import { encrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
    // Check for msisdn header
    let encryptedMsisdn = request.headers.get('msisdn');

    console.log("Encrypted MSISDN from Header:", encryptedMsisdn);

    const encryptionKey = process.env.HE_ENCRYPTION_KEY;

    const encryptionSecret = process.env.ENCRYPTION_SECRET_KEY;

    if (!encryptionSecret) {
        console.error('ENCRYPTION_SECRET_KEY not found in environment variables');
        return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
        );
    }

    const response: any = {};

    // Extract campaign info from query params
    const variant = request.nextUrl.searchParams.get('variant');
    const partnerRef = request.nextUrl.searchParams.get('partnerRef');
    const utm_campaign = request.nextUrl.searchParams.get('utm_campaign');

    // Store campaign data in Redis if all params are provided
    if (variant && partnerRef && utm_campaign) {
        try {
            // Get user IP from request
            const userIp =
                request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                request.headers.get('x-real-ip') ||
                'unknown';

            const campaignData = {
                variantName: variant,
                partnerId: parseInt(partnerRef, 10),
                campaignName: utm_campaign,
            };

            const campaignDataKey = await storeCampaignData(userIp, campaignData);
            if (campaignDataKey) {
                response.campaignDataKey = encrypt(campaignDataKey, encryptionSecret);
            }
        } catch (storeErr) {
            console.error('Failed to store campaign data in Redis:', storeErr);
            // Continue even if storage fails - not critical
        }
    }

    // Process MSISDN if provided
    if (encryptedMsisdn) {
        if (!encryptionKey) {
            console.error('HE_ENCRYPTION_KEY not found in environment variables');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Decrypt the msisdn
        let decryptedMsisdn = decryptMsisdn(encryptedMsisdn, encryptionKey);

        if (decryptedMsisdn && isValidMsisdn(decryptedMsisdn)) {
            // Log all request headers
            const headers: Record<string, string> = {};
            request.headers.forEach((value, key) => {
                headers[key] = value;
            });

            console.log('Complete Request Headers:', headers);
            console.log('Decrypted MSISDN:', decryptedMsisdn);

            // Get user IP from request
            const userIp =
                request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                request.headers.get('x-real-ip') ||
                'unknown';

            // Store decrypted MSISDN in Redis
            try {
                // Encrypt the decrypted msisdn
                const encryptedMsisdnValue = encrypt(decryptedMsisdn, encryptionSecret);
                response.msisdn = encryptedMsisdnValue;

                const redisKey = await storeDecryptedMsisdn(userIp, decryptedMsisdn, encryptedMsisdnValue);

                // Store redis key without encryption - Redis is not publicly exposed
                if (redisKey) {
                    response.redisKey = redisKey;
                }
            } catch (redisErr) {
                console.error('Failed to store MSISDN in Redis:', redisErr);
                // Continue even if Redis fails - not a critical failure
            }
        } else {
            console.warn('Invalid or tampered msisdn');
        }
    }

    // Always encrypt and return originateFromLanding flag
    response.originateFromLanding = encrypt('true', encryptionSecret);

    return NextResponse.json({
        message: 'Headers logged and msisdn validated',
        ...response,
    });
}
