/**
 * Application constants
 */

export const API_TIMEOUT_MS = 10000;
export const MAX_ENCRYPTED_DATA_LENGTH = 2048;

export const ERROR_MESSAGES = {
  MISSING_CLIENT_ID: 'Missing clientId parameter',
  INVALID_CLIENT_ID: 'Invalid clientId parameter',
  MISSING_CONFIG: 'Unable to fetch configuration',
  MISSING_MSISDN: 'Unable to fetch MSISDN data',
  ENCRYPTION_FAILED: 'Failed to encrypt data',
  INVALID_REQUEST: 'Invalid request body',
  UNAUTHORIZED: 'Unauthorized request',
} as const;

export const REGEX_PATTERNS = {
  // Client ID - alphanumeric, hyphens, underscores (UUID-like or custom)
  CLIENT_ID: /^[a-zA-Z0-9_-]{1,256}$/,
  // Base64 and URL-safe base64
  BASE64: /^[A-Za-z0-9\-_~=]+$/,
} as const;
