import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/encryption';
import { config } from '@/lib/config';
import { validateClientId, validateEncryptedPayload, sanitizeError } from '@/lib/validation';
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
 * Unified endpoint to handle the complete landing page process
 *
 * Flow:
 * 1. Validate clientId parameter
 * 2. Fetch MSISDN from external API server-side (keeps URL internal)
 * 3. Encrypt MSISDN and landing flag server-side
 * 4. Return encrypted data and redirect URL
 *
 * This consolidates 3 client-side requests into 1, improving:
 * - Performance: ~50-100ms instead of ~150-300ms
 * - Security: External API endpoint never exposed to client
 * - Maintainability: Single source of truth for the process
 */
export async function GET(request: Request) {
  try {
    // Extract and validate clientId
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');

    const clientIdValidation = validateClientId(clientId);
    if (!clientIdValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: clientIdValidation.error,
        },
        { status: 400 }
      );
    }

    // Fetch MSISDN from external API server-side
    // This keeps the external API URL internal and secure
    let msisdn: string | null = null;
    let msisdnError: string | null = null;
    console.log('[INFO] Fetching MSISDN from external API for clientId:', clientId);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

      const msisdnResponse = await fetch(config.msisdnApiUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!msisdnResponse.ok) {
        msisdnError = `External API returned ${msisdnResponse.status}`;
      } else {
        const msisdnData = await msisdnResponse.json();
        // Handle external API response structure
        msisdn = msisdnData?.data || msisdnData?.msisdn || null;
      }
    } catch (err) {
      msisdnError = `Failed to fetch MSISDN: ${sanitizeError(err)}`;
      if (process.env.NODE_ENV === 'development') {
        console.error('[DEBUG] MSISDN fetch error:', err);
      }
      // Don't fail completely - continue without MSISDN
    }

    // Prepare encryption payload
    const encryptPayload: { encryptedMsisdn?: string; encryptedFlag?: string } = {};

    // Encrypt MSISDN if available
    if (msisdn) {
      try {
        encryptPayload.encryptedMsisdn = encrypt(msisdn, config.encryptionSecretKey);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[DEBUG] MSISDN encryption error:', err);
        }
        // Continue without MSISDN on encryption error
      }
    }

    // Always encrypt the landing flag
    try {
      encryptPayload.encryptedFlag = encrypt('true', config.encryptionSecretKey);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[DEBUG] Flag encryption error:', err);
      }
      // If we can't encrypt the flag, this is a critical error
      return NextResponse.json(
        {
          success: false,
          message: ERROR_MESSAGES.ENCRYPTION_FAILED,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...encryptPayload,
        httpsAppUrl: config.httpsAppUrl,
      },
    });
  } catch (error) {
    console.error('[ERROR] /api/process error:', sanitizeError(error));
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
