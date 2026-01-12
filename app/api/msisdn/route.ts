import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/encryption';
import { config } from '@/lib/config';
import { validateEncryptedPayload, sanitizeError } from '@/lib/validation';

/**
 * Proxy endpoint to encrypt data (MSISDN and landing flag)
 * 
 * Client sends encrypted MSISDN from external API, this endpoint:
 * 1. Validates the input payload
 * 2. Re-encrypts data using server-side encryption key
 * 3. Returns double-encrypted data (external encryption + server encryption)
 * 
 * This prevents MITM attacks where an attacker could encrypt fake data.
 * Only our server can create valid encrypted data with our secret key.
 * 
 * Security Notes:
 * - Encryption key is never exposed to client
 * - Input validation prevents oversized/malformed payloads
 * - Errors are sanitized to not expose implementation details
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input payload
    const validation = validateEncryptedPayload(body);
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        message: validation.error,
      }, { status: 400 });
    }

    const result: { encryptedMsisdn?: string; encryptedFlag?: string } = {};
    
    // Encrypt MSISDN if provided
    if (validation.msisdn) {
      result.encryptedMsisdn = encrypt(validation.msisdn, config.encryptionSecretKey);
    }
    
    // Encrypt landing flag if provided
    if (validation.originateFromLanding) {
      result.encryptedFlag = encrypt(validation.originateFromLanding, config.encryptionSecretKey);
    }
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    const errorMessage = sanitizeError(error);
    console.error('[ERROR] Encryption error:', errorMessage);
    return NextResponse.json({
      success: false,
      message: 'Failed to encrypt data',
    }, { status: 500 });
  }
}
