import { NextRequest, NextResponse } from 'next/server';
import { decryptMsisdn, isValidMsisdn } from '@/lib/decryption';

export async function GET(request: NextRequest) {
  // Check for msisdn header
  const encryptedMsisdn = request.headers.get('msisdn');
  console.log("Encrypted MSISDN from Header:", encryptedMsisdn);

  if (!encryptedMsisdn) {
    return NextResponse.json(
      { error: 'Missing msisdn header' },
      { status: 400 }
    );
  }

  // Get encryption key from environment variables
  const encryptionKey = process.env.HE_ENCRYPTION_KEY;

  if (!encryptionKey) {
    console.error('HE_ENCRYPTION_KEY not found in environment variables');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Decrypt the msisdn
  const decryptedMsisdn = decryptMsisdn(encryptedMsisdn, encryptionKey);

  if (!decryptedMsisdn || !isValidMsisdn(decryptedMsisdn)) {
    return NextResponse.json(
      { error: 'Invalid or tampered msisdn' },
      { status: 400 }
    );
  }

  // Log all request headers
  const headers: Record<string, string> = {};

  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  console.log('Complete Request Headers:', headers);
  console.log('Decrypted MSISDN:', decryptedMsisdn);

  return NextResponse.json({
    message: 'Headers logged and msisdn validated',
    msisdn: decryptedMsisdn,
  });
}
