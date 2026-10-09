import type { Throttle } from '@nestjs/throttler';

/**
 * Stricter rate limit for sensitive endpoints (sign in, password reset...): 5 requests per minute per IP.
 * Usage: `@Throttle(STRICT_THROTTLE)`.
 */
export const STRICT_THROTTLE: Parameters<typeof Throttle>[0] = {
  default: { limit: 5, ttl: 60_000 },
};
