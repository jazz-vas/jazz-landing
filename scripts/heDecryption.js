const crypto = require('crypto');

function decryptSafe(encryptedText, key) {
    try {
        const algorithm = 'aes-256-ecb';
        const keyBuffer = Buffer.from(key, 'utf8');

        const decipher = crypto.createDecipheriv(algorithm, keyBuffer, null);

        // 1. Disable auto padding to prevent "bad decrypt" errors
        decipher.setAutoPadding(false);

        let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        // 2. Manually clean up any hidden padding characters (null bytes, etc.)
        // This regex removes non-printable characters often left by padding
        return decrypted.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

    } catch (error) {
        return `Still failing: ${error.message}`;
    }
}

const ciphertext = "yuWlCR7wsIofB2v6GXHseg==";
// const ciphertext = "J3WCOecVpT0XP56i2ycPIw=="
// const key = "msisdnenmsisdnenmsisdnenmsisdnen";
const key = "MSISDNENMSISDNENMSISDNENMSISDNEN";

console.log("Decrypted result:", decryptSafe(ciphertext, key));