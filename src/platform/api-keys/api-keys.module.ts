import { Module } from '@nestjs/common';
import { ApiKeyValidator } from './application/services/api-key-validator.js';
import { ApiKeyGuard } from './infra/http/guards/api-key.guard.js';
import { ApiKeyValidatorService } from './infra/services/api-key-validator.service.js';

/**
 * API key authentication for external systems. Keys are managed by admins (see AdminApiKeysModule).
 */
@Module({
  providers: [{ provide: ApiKeyValidator, useClass: ApiKeyValidatorService }, ApiKeyGuard],
  exports: [ApiKeyValidator, ApiKeyGuard],
})
export class ApiKeysModule {}
