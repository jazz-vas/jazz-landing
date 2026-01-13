/**
 * Validation utilities for input sanitization and verification
 */

import { REGEX_PATTERNS, MAX_ENCRYPTED_DATA_LENGTH, ERROR_MESSAGES } from './constants';

/**
 * Validates clientId parameter format
 */
export function validateClientId(clientId: unknown): { valid: boolean; error: string | null } {
  if (typeof clientId !== 'string') {
    return { valid: false, error: ERROR_MESSAGES.INVALID_CLIENT_ID };
  }

  if (clientId.trim().length === 0) {
    return { valid: false, error: ERROR_MESSAGES.MISSING_CLIENT_ID };
  }

  if (!REGEX_PATTERNS.CLIENT_ID.test(clientId)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_CLIENT_ID };
  }

  return { valid: true, error: null };
}

/**
 * Validates encrypted MSISDN payload from client
 */
export function validateEncryptedPayload(data: unknown): {
  valid: boolean;
  error: string | null;
  msisdn?: string;
  originateFromLanding?: string;
} {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_REQUEST };
  }

  const body = data as Record<string, unknown>;
  const { msisdn, originateFromLanding } = body;

  // Type validation
  if (msisdn !== undefined && typeof msisdn !== 'string') {
    return { valid: false, error: 'msisdn must be a string' };
  }

  if (originateFromLanding !== undefined && typeof originateFromLanding !== 'string') {
    return { valid: false, error: 'originateFromLanding must be a string' };
  }

  // Trim values
  const msisdnTrimmed = (msisdn as string | undefined)?.trim();
  const flagTrimmed = (originateFromLanding as string | undefined)?.trim();

  // Empty validation - at least one required
  if (!msisdnTrimmed && !flagTrimmed) {
    return {
      valid: false,
      error: 'At least one field (msisdn or originateFromLanding) is required',
    };
  }

  // Size validation
  if (msisdnTrimmed && msisdnTrimmed.length > MAX_ENCRYPTED_DATA_LENGTH) {
    return {
      valid: false,
      error: `msisdn exceeds maximum size of ${MAX_ENCRYPTED_DATA_LENGTH} characters`,
    };
  }

  if (flagTrimmed && flagTrimmed.length > MAX_ENCRYPTED_DATA_LENGTH) {
    return {
      valid: false,
      error: `originateFromLanding exceeds maximum size of ${MAX_ENCRYPTED_DATA_LENGTH} characters`,
    };
  }

  // Format validation - check if looks like encrypted base64
  if (msisdnTrimmed && !isValidBase64(msisdnTrimmed)) {
    return {
      valid: false,
      error: 'Invalid encrypted MSISDN format (must be base64 encoded)',
    };
  }

  return {
    valid: true,
    error: null,
    msisdn: msisdnTrimmed,
    originateFromLanding: flagTrimmed,
  };
}

/**
 * Checks if string is valid base64 (standard or URL-safe)
 */
export function isValidBase64(str: string): boolean {
  try {
    if (!REGEX_PATTERNS.BASE64.test(str)) {
      return false;
    }
    // Validate length is multiple of 4 (before padding)
    const cleanStr = str.replace(/~/g, '=').replace(/-/g, '+').replace(/_/g, '/');
    return cleanStr.length % 4 === 0;
  } catch {
    return false;
  }
}

/**
 * Sanitize error message for logging (remove sensitive details)
 */
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // Only log message, not full stack trace
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}
