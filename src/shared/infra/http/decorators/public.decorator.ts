import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Skips authentication on a route (or on every route of a controller).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
