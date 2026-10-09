import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AdminModule } from '@admin/admin.module.js';
import { API_KEY_HEADER } from '@platform/api-keys/infra/http/guards/api-key.guard.js';
import { PlatformModule } from '@platform/platform.module.js';
import { HealthModule } from '@shared/infra/health/health.module.js';

export const PUBLIC_REFERENCE_PATH = '/api/reference';
export const ADMIN_REFERENCE_PATH = '/api/admin/reference';

/**
 * Serves two API references: the public API and the back-office API, each listing only its own modules.
 */
export function setupApiReference(app: INestApplication, title: string) {
  const publicConfig = new DocumentBuilder()
    .setTitle(title)
    .setDescription('API Reference')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearer')
    .addApiKey({ type: 'apiKey', name: API_KEY_HEADER, in: 'header' }, 'api-key')
    .build();

  const adminConfig = new DocumentBuilder()
    .setTitle(`[Admin] ${title}`)
    .setDescription('Back-office API Reference (staff only)')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'admin-jwt')
    .build();

  // `include` must never be empty: an empty list means "every module".
  const publicDocument = SwaggerModule.createDocument(app, publicConfig, {
    include: [PlatformModule, HealthModule],
    deepScanRoutes: true,
  });
  const adminDocument = SwaggerModule.createDocument(app, adminConfig, {
    include: [AdminModule],
    deepScanRoutes: true,
  });

  app.use(PUBLIC_REFERENCE_PATH, apiReference({ content: cleanupOpenApiDoc(publicDocument) }));
  app.use(ADMIN_REFERENCE_PATH, apiReference({ content: cleanupOpenApiDoc(adminDocument) }));
}
