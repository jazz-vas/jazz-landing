# Quick Reference Card

## HTTP App (jazz-landing) - Current Setup

### Environment Variables (.env.local)
```bash
MSISDN_API_URL=http://jazzred-cms-stg.jazz.com.pk/jazz/v1/api/proxy/msisdn
HTTPS_APP_URL=https://localhost:3000
RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----...[configured]...-----END PUBLIC KEY-----"
```

### API Endpoints
- `GET /api/config` - Returns client-safe configuration
- `GET /api/msisdn` - Fetches and returns encrypted MSISDN

### Key Files
- `lib/config.ts` - Runtime configuration
- `lib/encryption.ts` - RSA encryption (public key only)
- `lib/msisdnService.ts` - MSISDN fetching service
- `app/api/config/route.ts` - Config API
- `app/api/msisdn/route.ts` - MSISDN API
- `app/page.tsx` - Landing page component

### Commands
```bash
npm run dev           # Start dev server on port 3001
npm run build         # Build for production
npm run start         # Start production server
npm run generate-keys # Generate new RSA key pair
```

### Generated Keys
- `keys/public.pem` - Public key (used by this app)
- `keys/private.pem` - Private key (copy to HTTPS app)

---

## HTTPS App (jazz-products) - Required Setup

### Environment Variables (.env.local)
```bash
RSA_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----"
```

### Required Files to Create
1. `lib/decryption.ts` - Implements RSA decryption
2. `app/api/decrypt/route.ts` - API endpoint for decryption
3. Update landing page to extract and decrypt hash parameters

### Dependencies to Install
```bash
npm install node-forge
npm install --save-dev @types/node-forge
```

---

## Testing Flow

1. **Start HTTP App**: `npm run dev` (port 3001)
2. **Visit**: `http://localhost:3001?clientId=test123`
3. **Expected**: Redirects to `https://localhost:3000?clientId=test123#originateFromLanding=true&msisdn=<encrypted>`
4. **HTTPS App**: Decrypts and displays MSISDN

## Security Checklist

- [x] Environment variables without NEXT_PUBLIC prefix
- [x] Runtime environment variable injection
- [x] Asymmetric RSA encryption implemented
- [x] Public key configured in HTTP app
- [x] Private key generated (ready for HTTPS app)
- [x] Keys excluded from git (.gitignore updated)
- [x] Server-side API routes for encryption
- [x] Client-side only receives necessary config
- [ ] HTTPS app decryption setup (pending)
- [ ] Production key management system (pending)

## Documentation

- `ENCRYPTION.md` - Full encryption documentation
- `HTTPS_APP_SETUP.md` - Setup guide for jazz-products
- `IMPLEMENTATION_SUMMARY.md` - Complete change summary
- `README_REFERENCE.md` - This file

---

**Status**: HTTP app (jazz-landing) setup complete ✅  
**Next**: Set up decryption in HTTPS app (jazz-products)
