import { Module } from '@nestjs/common';
import { AdminApiKeysModule } from './api-keys/admin-api-keys.module.js';
import { AdminAuthModule } from './auth/admin-auth.module.js';

/**
 * Back-office API, documented at /api/admin/reference. Add the back-office feature modules here.
 */
@Module({
  imports: [AdminAuthModule, AdminApiKeysModule],
})
export class AdminModule {}
