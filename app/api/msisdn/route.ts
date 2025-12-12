import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/encryption';
import { config } from '@/lib/config';

/**
 * Proxy endpoint to encrypt data (MSISDN and landing flag)
 * Client sends raw data, server encrypts it using RSA public key
 * This prevents MITM attacks where attacker could encrypt fake data
 */
export async function POST(request: Request) {
  try {
    const { msisdn, originateFromLanding } = await request.json();
    
    if (!msisdn && !originateFromLanding) {
      return NextResponse.json({
        success: false,
        message: 'At least one field (msisdn or originateFromLanding) is required',
      }, { status: 400 });
    }
    
    const result: { encryptedMsisdn?: string; encryptedFlag?: string } = {};
    
    // Encrypt MSISDN if provided
    if (msisdn) {
      result.encryptedMsisdn = encrypt(msisdn, config.encryptionSecretKey);
    }
    
    // Encrypt landing flag if provided
    if (originateFromLanding) {
      result.encryptedFlag = encrypt(originateFromLanding, config.encryptionSecretKey);
    }
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Encryption error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to encrypt data',
    }, { status: 500 });
  }
}
