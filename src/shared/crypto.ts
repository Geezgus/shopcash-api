import { createHash, randomBytes } from 'node:crypto';

/**
 * Generates a URL-safe random token (refresh tokens, reset tokens, API keys...).
 */
export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/**
 * Hashes a high-entropy token for storage. Only use it for random tokens, never for passwords.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
