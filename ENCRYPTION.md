# Jazz Landing - HTTP App (Encryption Documentation)

This application uses **asymmetric RSA encryption** to securely transmit MSISDN data from the HTTP landing page to the HTTPS product page.

## Architecture Overview

```
HTTP App (jazz-landing)          HTTPS App (jazz-products)
     [Public Key] ─────encrypts───────▶ [Private Key]
                                        decrypts
```

### Flow:
1. User lands on HTTP app with `?clientId=xyz`
2. HTTP app fetches MSISDN from the backend API
3. MSISDN is encrypted using **RSA public key**
4. Encrypted MSISDN is sent to HTTPS app via URL hash
5. HTTPS app decrypts using **RSA private key**

## Setup Instructions

### 1. Generate RSA Key Pair

Run the key generation script:

```bash
node scripts/generate-keys.js
```

This will create:
- `keys/public.pem` - For this app (jazz-landing)
- `keys/private.pem` - For jazz-products app

### 2. Configure Environment Variables

Update `.env.local` with the generated public key:

```bash
# API Configuration (Server-side only - injected at runtime)
MSISDN_API_URL=http://jazzred-cms-stg.jazz.com.pk/jazz/v1/api/proxy/msisdn
HTTPS_APP_URL=https://localhost:3000

# RSA Public Key for asymmetric encryption
RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
<paste contents of keys/public.pem here>
-----END PUBLIC KEY-----"
```

**Important Notes:**
- Environment variables NO LONGER use `NEXT_PUBLIC_` prefix
- These are server-side only and injected at runtime
- The public key is safe to include in environment variables
- Never commit the private key to version control

### 3. Share Private Key with HTTPS App

Copy `keys/private.pem` to the jazz-products repository and configure it there for decryption.

## Key Features

### Runtime Environment Variables
- Environment variables are accessed server-side only
- No `NEXT_PUBLIC_` prefix needed
- Configuration is injected at runtime via API routes
- Client only receives non-sensitive config via `/api/config`

### Asymmetric Encryption
- Uses RSA-OAEP with SHA-256
- 2048-bit key size
- Public key encryption (this app)
- Private key decryption (jazz-products app)
- Provides forward secrecy

### Security Benefits
1. **One-way encryption**: HTTP app can only encrypt, not decrypt
2. **No shared secrets**: No symmetric keys that could be compromised
3. **Server-side processing**: Sensitive operations happen server-side
4. **Secure key storage**: Private key never leaves HTTPS app

## API Routes

### `/api/config`
Returns client-safe configuration:
```json
{
  "httpsAppUrl": "https://localhost:3000"
}
```

### `/api/msisdn`
Fetches and encrypts MSISDN:
```json
{
  "success": true,
  "data": "base64-encrypted-msisdn"
}
```

## Development

```bash
# Install dependencies
npm install

# Generate RSA keys
node scripts/generate-keys.js

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## Production Deployment

1. Generate RSA key pair in secure environment
2. Set environment variables in deployment platform
3. Ensure `RSA_PUBLIC_KEY` includes full PEM format with headers
4. Deploy with runtime environment variable injection
5. Verify encryption works by checking console logs

## Troubleshooting

### "RSA public key not configured" error
- Ensure `RSA_PUBLIC_KEY` is set in `.env.local`
- Verify the key includes `-----BEGIN PUBLIC KEY-----` and `-----END PUBLIC KEY-----` headers
- Check for any extra whitespace or line breaks

### Environment variables not loading
- Restart the development server after changing `.env.local`
- Verify no `NEXT_PUBLIC_` prefix is used
- Check that variables are accessed via `config` module, not directly

### Encryption fails
- Verify the public key is valid PEM format
- Check console logs for detailed error messages
- Ensure node-forge is installed: `npm install node-forge`

## Security Recommendations

1. **Key Rotation**: Regularly rotate RSA key pairs
2. **Key Storage**: Use secure secret management systems in production
3. **Access Control**: Limit who can access private keys
4. **Monitoring**: Log encryption failures for security auditing
5. **HTTPS Only**: Always serve production app over HTTPS

## Related Files

- `lib/config.ts` - Runtime configuration management
- `lib/encryption.ts` - RSA encryption implementation
- `lib/msisdnService.ts` - MSISDN fetching service
- `app/api/msisdn/route.ts` - API route for encrypted MSISDN
- `app/api/config/route.ts` - API route for client config
- `scripts/generate-keys.js` - RSA key pair generator
