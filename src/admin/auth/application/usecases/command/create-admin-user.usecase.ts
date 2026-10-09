import { AdminUser } from '@admin/auth/domain/entities/admin-user.js';
import { AdminUserAlreadyExistsException } from '@admin/auth/domain/exceptions/admin-user.exceptions.js';
import type { AdminUserRepository } from '@admin/auth/domain/repositories/admin-user.repository.js';
import type { AdminRole } from '@admin/auth/domain/types/admin-role.js';
import type { UseCase } from '@shared/application/usecase.js';
import type { PasswordPolicyValidator } from '@shared/domain/services/password-policy-validator.js';
import { createPassword } from '@shared/domain/value-objects/password.js';
import { normalizeEmail } from '@shared/validation.js';

export class CreateAdminUserUseCase implements UseCase<CreateAdminUserInput, CreateAdminUserOutput> {
  constructor(
    private readonly adminUserRepository: AdminUserRepository,
    private readonly passwordPolicyValidator?: PasswordPolicyValidator,
  ) {}

  async execute(input: CreateAdminUserInput): Promise<CreateAdminUserOutput> {
    const email = normalizeEmail(input.email);
    if (await this.adminUserRepository.existsByEmail(email)) {
      throw new AdminUserAlreadyExistsException({ email });
    }

    const admin = AdminUser.create(
      input.name,
      email,
      await createPassword(input.password, this.passwordPolicyValidator),
      input.role,
    );
    await this.adminUserRepository.save(admin);

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }
}

export interface CreateAdminUserInput {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}

export interface CreateAdminUserOutput {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
