import type { Request } from 'express';

/**
 * Extracts the token from an `Authorization: Bearer <token>` header.
 */
export function extractBearerToken(request: Request): string | null {
  const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}
