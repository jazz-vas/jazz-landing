import { NextResponse } from 'next/server';
import { fetchMsisdn } from '@/lib/msisdnService';
import { encrypt } from '@/lib/encryption';

export async function GET() {
  try {
    const result = await fetchMsisdn();
    
    if (!result.success || !result.data) {
      return NextResponse.json({
        success: false,
        message: result.message || 'Failed to fetch MSISDN',
      });
    }
    
    // Encrypt MSISDN using RSA public key
    const encryptedMsisdn = encrypt(result.data);
    
    return NextResponse.json({
      success: true,
      data: encryptedMsisdn,
    });
  } catch (error: any) {
    console.error('MSISDN API error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'An unexpected error occurred',
    }, { status: 500 });
  }
}
