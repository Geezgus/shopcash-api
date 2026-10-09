import { Module } from '@nestjs/common';
import { AdminTokenValidator } from './application/services/admin-token-validator.js';
import { AdminAuthController } from './infra/http/controllers/admin-auth.controller.js';
import { AdminUsersController } from './infra/http/controllers/admin-users.controller.js';
import { AdminAuthGuard } from './infra/http/guards/admin-auth.guard.js';
import { AdminAuthService } from './infra/services/admin-auth.service.js';
import { AdminTokenValidatorService } from './infra/services/admin-token-validator.service.js';
import { SeedSuperAdminService } from './infra/services/seed-super-admin.service.js';

/**
 * Back-office users: sign in, roles and admin management.
 * Import this module and use `@UseGuards(AdminAuthGuard)` to protect routes of other admin modules.
 */
@Module({
  controllers: [AdminAuthController, AdminUsersController],
  providers: [
    { provide: AdminTokenValidator, useClass: AdminTokenValidatorService },
    AdminAuthService,
    AdminAuthGuard,
    SeedSuperAdminService,
  ],
  exports: [AdminTokenValidator, AdminAuthGuard],
})
export class AdminAuthModule {}
