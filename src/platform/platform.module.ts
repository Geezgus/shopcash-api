import { Module } from '@nestjs/common';
import { ApiKeysModule } from './api-keys/api-keys.module.js';
import { AuthModule } from './users/auth.module.js';

/**
 * Public API, documented at /api/reference. Add the product's feature modules here.
 */
@Module({
  imports: [AuthModule, ApiKeysModule],
})
export class PlatformModule {}
