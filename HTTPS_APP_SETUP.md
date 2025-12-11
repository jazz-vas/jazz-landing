# HTTPS App (jazz-products) - Decryption Setup Guide

This document provides instructions for setting up RSA decryption in the jazz-products HTTPS app.

## Private Key

The private key has been generated. You'll need to add it to your `.env.local` file in the jazz-products repository:

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAxM7pQPCtXSDN1TyIY8kkm/LtkCy4AxnaNbZBf/VyqDRcAecD
QNNx6m1WHX5kv5WYD7sANjlC/SRbIzVuM/Olu1+PUpsS8bbAN0gSVnn2L2O+eLDP
2mN7cl2n1HGLCaTGa6pJzFrnN64+dYKsqqzhTqzMOcWm9p7SBGe30uptetMLfKwy
x4Dt85Orl2iw/Pljw98bC3mjmSI9ELzUauBWknltt0CloHLysx4FXiEaC0+Gvr6/
EsX9OwBf8/DqB2/710oeorZAse2C6WYb2ZI5exWVj/yKftRL5oDcXVgpznPG6yIS
5HsiSkcxbbY/GAhDJVEhGFOEN2Fc8YBZsfUurwIDAQABAoIBACjSqnt38N3yYf+r
MLdSD6/xcemH/RtXj3W4ullqdkABrFwQqRIXSffQeh5gC1HaG9KXfXHB6u1LT0Q8
XwGTtnrpVXdTB1jwCWruHi+l2LT3wZiTRGoOXJraZmegrbBwZ2AJ0Ij9Chz4nagO
VPaKKaoCGdKZ9woM449aXDz5t3/UTdHD//cbPcUOJaf6pXejz/mTf/PjAZ7cZJ2R
4vIYnEn4owBU4wIZEZ69e9YP9P4Xaw1nOqcbsdZoSr/w+Jb/VetBoPXtj3aiU68v
EQ1rnJzPiXDWrhIpBsPWBvYqslztb2rRzy4dlqGtnrlOagqdd7RSDEokaVRy6j2T
bsNR6eECgYEA54ONZmSQo7nj/dUrZhOHlacXm+jiZhAUkDfn4MHLCsgf+kf4nt29
gVdZu6xHzOKHj5y6sfdpTrTz99THvHoz9bPDMFX8IAKChOUhMB/STYKyCuFdPLNX
BNp+i7v/7A3q4pNM8aONemJDJLN6raZ8Az/IsKz2glnGgDH8fymfcHcCgYEA2Z+s
J7zbVRrEFD0+SEUhqgEk3629cMxSC2vS3t7WbZn4yaDsl2iAuA6JEdkZKLzUTCl3
ymXt+Gr3QW/N1WGyWJLLSU2yThqc2lu/b7CfYTWW6QXGFJFkLRSU2WvLGv7fNer2
H49nrBApGmtrOZesOFSIUI1l5+YwCP5hwvqEuYkCgYEAy8pQONbDP2wNlk4D8sm0
Kva34IUCbWcwQrcDhSPxsB7zjyO1ZVq5StZyZbJETcUGIVOMP8YSy7abnweNfopv
nJPNeInn8uFitMrhCPSp8ZLfWJaCtUEEk4AlrqkhoU+q+CFDtN0MV7OReQgIMD2B
onaOGX9XSuztv8DAi8s+zwcCgYEAoFbyonyVJUkJOtg8sUauHPGm117M+vSvZlbV
EPwiBLKzCOuWJaALZpDfENVhohAuYscSyX78LFGzRvU3NIY8vuG5AZNLUhxtgLyk
eYgqhZbUT2+/l5vfsQ8+9EplZMhwcOti17Hy8mUdw6dtYwuLCh3OKXtkn82LirTS
FrQ5YfECgYAOL5q6s6U3SisDSu2TRBkwZp3VDJkbskN7XRkWGOskPR701+kUZLB0
JU1qGjkk7kUxnNdPVcyi25TnnBK5YZQKxKglPUIA4jPrSlPxBzBTHAUOUbTQUwLp
E4j1vWJA+UWIyLG6kMe8IRees/F+nB/WaShVktOsRW1lBeqlCmbqFQ==
-----END RSA PRIVATE KEY-----
```

## Implementation Steps

### 1. Install Dependencies

```bash
npm install node-forge
npm install --save-dev @types/node-forge
```

### 2. Create Decryption Library

Create `lib/decryption.ts`:

```typescript
import forge from 'node-forge';

const RSA_PRIVATE_KEY = process.env.RSA_PRIVATE_KEY || '';

/**
 * Decrypts RSA encrypted data using the private key
 * @param encryptedBase64 - The encrypted data in base64 format
 * @returns The decrypted text
 */
export function decrypt(encryptedBase64: string): string {
  try {
    if (!RSA_PRIVATE_KEY) {
      throw new Error('RSA private key not configured');
    }

    // Parse the private key
    const privateKey = forge.pki.privateKeyFromPem(RSA_PRIVATE_KEY);
    
    // Decode from base64
    const encrypted = forge.util.decode64(encryptedBase64);
    
    // Decrypt the data
    const decrypted = privateKey.decrypt(encrypted, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: {
        md: forge.md.sha256.create()
      }
    });
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}
```

### 3. Update Environment Variables

Add to `.env.local`:

```bash
# RSA Private Key for asymmetric decryption
# DO NOT COMMIT THIS TO VERSION CONTROL
RSA_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
<paste the private key from above>
-----END RSA PRIVATE KEY-----"
```

### 4. Update Your Page Component

In your landing page component, extract and decrypt the MSISDN from the hash:

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function ProductPage() {
  const [msisdn, setMsisdn] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    // Get clientId from query params
    const params = new URLSearchParams(window.location.search);
    const id = params.get('clientId');
    setClientId(id);

    // Get encrypted MSISDN from hash
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const originatedFromLanding = hashParams.get('originateFromLanding');
    const encryptedMsisdn = hashParams.get('msisdn');

    if (originatedFromLanding === 'true' && encryptedMsisdn) {
      // Call API to decrypt MSISDN
      decryptMsisdn(encryptedMsisdn);
    }
  }, []);

  const decryptMsisdn = async (encrypted: string) => {
    try {
      const response = await fetch('/api/decrypt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ encrypted }),
      });

      const result = await response.json();
      
      if (result.success) {
        setMsisdn(result.msisdn);
        console.log('Decrypted MSISDN:', result.msisdn);
      }
    } catch (error) {
      console.error('Failed to decrypt MSISDN:', error);
    }
  };

  return (
    <div>
      <h1>Product Page</h1>
      {clientId && <p>Client ID: {clientId}</p>}
      {msisdn && <p>MSISDN: {msisdn}</p>}
    </div>
  );
}
```

### 5. Create Decryption API Route

Create `app/api/decrypt/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/decryption';

export async function POST(request: Request) {
  try {
    const { encrypted } = await request.json();
    
    if (!encrypted) {
      return NextResponse.json({
        success: false,
        message: 'No encrypted data provided',
      }, { status: 400 });
    }

    const msisdn = decrypt(encrypted);
    
    return NextResponse.json({
      success: true,
      msisdn,
    });
  } catch (error: any) {
    console.error('Decryption API error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to decrypt data',
    }, { status: 500 });
  }
}
```

## Security Considerations

⚠️ **CRITICAL**: 
- **NEVER** commit the private key to version control
- Store the private key in secure secret management systems in production
- Restrict access to the private key
- Monitor decryption operations for security auditing
- Rotate keys regularly
- Always serve the app over HTTPS

## Testing

1. Start the HTTP app (jazz-landing): `http://localhost:3001?clientId=test123`
2. It will redirect to: `https://localhost:3000?clientId=test123#originateFromLanding=true&msisdn=<encrypted>`
3. The HTTPS app should decrypt the MSISDN and display it

## Troubleshooting

### "RSA private key not configured" error
- Ensure `RSA_PRIVATE_KEY` is set in `.env.local`
- Verify the key includes headers and footers
- Check for extra whitespace

### Decryption fails
- Verify you're using the matching key pair
- Check that the encryption in jazz-landing is working
- Ensure the base64 encoding/decoding is correct
- Check console logs for detailed errors

### Environment variables not loading
- Restart the development server
- Verify no `NEXT_PUBLIC_` prefix
- Ensure the key is properly formatted in `.env.local`
