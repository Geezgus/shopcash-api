import { Logger, type LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ADMIN_REFERENCE_PATH, PUBLIC_REFERENCE_PATH, setupApiReference } from './api-reference.js';
import { AppModule } from './app.module.js';
import { configureApp, GLOBAL_PREFIX } from './configure-app.js';
import { env, LOG_LEVELS } from './env.js';

const logger = new Logger('NestApplication');

async function bootstrap() {
  const logLevels: LogLevel[] = LOG_LEVELS.slice(0, LOG_LEVELS.indexOf(env.LOG_LEVEL) + 1);
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: logLevels });

  configureApp(app);
  if (env.API_DOCS_ENABLED) {
    setupApiReference(app, 'Shopcash API');
  }

  await app.listen(env.API_PORT);

  const url = (await app.getUrl()).replace('[::1]', 'localhost');
  logger.log(`Server running at ${url}/${GLOBAL_PREFIX}`);
  if (env.API_DOCS_ENABLED) {
    logger.log(`API reference available at ${url}${PUBLIC_REFERENCE_PATH}`);
    logger.log(`Admin API reference available at ${url}${ADMIN_REFERENCE_PATH}`);
  }
}

bootstrap().catch((error: unknown) => {
  logger.fatal('Application startup failed', error instanceof Error ? error.stack : error);
  process.exit(1);
});
