#!/usr/bin/env node

/**
 * Script to generate RSA key pair for asymmetric encryption
 * 
 * Usage: node scripts/generate-keys.js
 * 
 * This will generate:
 * - public.pem: Public key (to be used in jazz-landing HTTP app)
 * - private.pem: Private key (to be used in jazz-products HTTPS app)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('Generating RSA key pair (2048-bit)...\n');

// Generate key pair using native crypto
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

const publicKeyPem = publicKey;
const privateKeyPem = privateKey;

// Save to files
const keysDir = path.join(__dirname, '..', 'keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir);
}

fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKeyPem);
fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKeyPem);

console.log('✅ Keys generated successfully!\n');
console.log('📁 Keys saved to:');
console.log('   - keys/public.pem  (for jazz-landing HTTP app)');
console.log('   - keys/private.pem (for jazz-products HTTPS app)\n');
console.log('⚠️  IMPORTANT:');
console.log('   1. Add the public key to .env.local in jazz-landing:');
console.log('      RSA_PUBLIC_KEY="<contents of public.pem>"');
console.log('   2. Add the private key to .env.local in jazz-products:');
console.log('      RSA_PRIVATE_KEY="<contents of private.pem>"');
console.log('   3. Add keys/ to .gitignore to keep keys secure');
console.log('   4. NEVER commit private keys to version control!\n');

// Display the keys for easy copying
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('PUBLIC KEY (for jazz-landing):');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(publicKeyPem);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('PRIVATE KEY (for jazz-products):');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(privateKeyPem);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
