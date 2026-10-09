import { Module } from '@nestjs/common';
import { AdminAuthModule } from '@admin/auth/admin-auth.module.js';
import { AdminApiKeysController } from './infra/http/controllers/admin-api-keys.controller.js';
import { AdminApiKeysService } from './infra/services/admin-api-keys.service.js';

/**
 * Back-office management of the API keys used by external systems.
 */
@Module({
  imports: [AdminAuthModule],
  controllers: [AdminApiKeysController],
  providers: [AdminApiKeysService],
})
export class AdminApiKeysModule {}
