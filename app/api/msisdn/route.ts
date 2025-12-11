import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/encryption';
import { config } from '@/lib/config';

/**
 * Proxy endpoint to encrypt MSISDN
 * Client sends raw MSISDN, server encrypts it using RSA public key
 * This prevents MITM attacks where attacker could encrypt fake MSISDN
 */
export async function POST(request: Request) {
  try {
    const { msisdn } = await request.json();
    
    if (!msisdn) {
      return NextResponse.json({
        success: false,
        message: 'MSISDN is required',
      }, { status: 400 });
    }
    
    // Encrypt MSISDN using RSA public key (server-side only)
    const encryptedMsisdn = encrypt(msisdn, config.rsaPublicKey);
    
    return NextResponse.json({
      success: true,
      data: encryptedMsisdn,
    });
  } catch (error: any) {
    console.error('MSISDN encryption error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to encrypt MSISDN',
    }, { status: 500 });
  }
}
