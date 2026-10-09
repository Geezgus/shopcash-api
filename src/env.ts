import { createEnv } from '@t3-oss/env-core';
import * as z from 'zod';

// Loads `.env` from the working directory when present. Real environment variables take precedence.
try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on the process environment.
}

const portSchema = z.coerce.number().int().min(0).max(65535);
const secondsSchema = z.coerce.number().int().positive();

export const LOG_LEVELS = ['fatal', 'error', 'warn', 'log', 'debug', 'verbose'] as const;

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(LOG_LEVELS).default('log'),

    // HTTP
    API_PORT: portSchema.default(3000),
    API_DOCS_ENABLED: z.stringbool().default(true),
    // Comma-separated list of allowed origins. When unset, any origin is allowed outside production.
    CORS_ORIGINS: z
      .string()
      .transform((value) =>
        value
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
      )
      .optional(),
    // Set when running behind a reverse proxy so rate limiting sees the real client IP.
    TRUST_PROXY: z.stringbool().default(false),
    RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(100),

    // Database
    DATABASE_HOSTNAME: z.string().min(1).default('localhost'),
    DATABASE_PORT: portSchema.default(5432),
    DATABASE_USERNAME: z.string().min(1),
    DATABASE_PASSWORD: z.string().min(1),
    DATABASE_NAME: z.string().min(1),
    DATABASE_RUN_MIGRATIONS: z.stringbool().default(true),
    // Never enable in production: it alters the schema to match the entities and may drop data.
    DATABASE_SYNCHRONIZE: z.stringbool().default(false),
    DATABASE_LOGGING: z.stringbool().default(false),

    // Auth
    TOKEN_SECRET: z.string().min(32, 'TOKEN_SECRET must be at least 32 characters'),
    ACCESS_TOKEN_TTL_SECONDS: secondsSchema.default(15 * 60),
    REFRESH_TOKEN_TTL_SECONDS: secondsSchema.default(7 * 24 * 60 * 60),
    ADMIN_ACCESS_TOKEN_TTL_SECONDS: secondsSchema.default(60 * 60),

    // Bootstrap super admin, created on startup if it does not exist yet.
    SYSADMIN_NAME: z.string().min(1).optional(),
    SYSADMIN_EMAIL: z.email().optional(),
    SYSADMIN_PASSWORD: z.string().min(1).optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
