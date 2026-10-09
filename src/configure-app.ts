import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { env } from './env.js';

export const GLOBAL_PREFIX = 'api';

/**
 * HTTP setup shared by main.ts and the e2e tests.
 */
export function configureApp(app: NestExpressApplication) {
  app.set('trust proxy', env.TRUST_PROXY);
  // CSP is disabled because this server only returns JSON, and the API reference pages load scripts from a CDN.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.enableCors({ origin: env.CORS_ORIGINS ?? env.NODE_ENV !== 'production' });
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.enableShutdownHooks();
}
