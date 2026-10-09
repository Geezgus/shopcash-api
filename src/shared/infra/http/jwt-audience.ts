/**
 * Every access token is signed for one audience and only accepted by the guard of that audience,
 * so a platform user's token can never be used on admin routes (and vice versa).
 */
export const JwtAudience = {
  PLATFORM: 'platform',
  ADMIN: 'admin',
} as const;

export type JwtAudience = (typeof JwtAudience)[keyof typeof JwtAudience];
