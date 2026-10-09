import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { CreateAdminUserUseCase } from '@admin/auth/application/usecases/command/create-admin-user.usecase.js';
import { AdminRole } from '@admin/auth/domain/types/admin-role.js';
import { PasswordPolicyValidator } from '@shared/domain/services/password-policy-validator.js';
import { TypeOrmUnitOfWork } from '@shared/infra/database/typeorm-unit-of-work.js';
import { normalizeEmail } from '@shared/validation.js';
import { env } from '@/env.js';
import { AdminUserTypeOrmRepository } from '../database/repositories/admin-user.typeorm-repository.js';

/**
 * Creates the first super admin from SYSADMIN_* environment variables, if it does not exist yet.
 */
@Injectable()
export class SeedSuperAdminService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedSuperAdminService.name);

  constructor(
    private readonly unitOfWork: TypeOrmUnitOfWork,
    private readonly passwordPolicyValidator: PasswordPolicyValidator,
  ) {}

  async onApplicationBootstrap() {
    const { SYSADMIN_NAME: name, SYSADMIN_EMAIL: email, SYSADMIN_PASSWORD: password } = env;
    if (!name || !email || !password) {
      this.logger.warn('SYSADMIN_NAME, SYSADMIN_EMAIL or SYSADMIN_PASSWORD not set: skipping super admin seed.');
      return;
    }

    const created = await this.unitOfWork.execute(async (manager) => {
      const repository = new AdminUserTypeOrmRepository(manager);
      if (await repository.existsByEmail(normalizeEmail(email))) return false;

      await new CreateAdminUserUseCase(repository, this.passwordPolicyValidator).execute({
        name,
        email,
        password,
        role: AdminRole.SUPER_ADMIN,
      });
      return true;
    });

    if (created) {
      this.logger.log(`Super admin created: ${name} <${email}>`);
    }
  }
}
