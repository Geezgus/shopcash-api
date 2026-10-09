import type { AdminUserRepository } from '@admin/auth/domain/repositories/admin-user.repository.js';
import type { AdminRole } from '@admin/auth/domain/types/admin-role.js';
import type { UseCase } from '@shared/application/usecase.js';
import { InvalidCredentialsException } from '@shared/domain/exceptions/auth.exceptions.js';
import { simulatePasswordCheck } from '@shared/domain/value-objects/password.js';
import { normalizeEmail } from '@shared/validation.js';

export class SignInAdminUseCase implements UseCase<SignInAdminInput, SignInAdminOutput> {
  constructor(private readonly adminUserRepository: AdminUserRepository) {}

  async execute(input: SignInAdminInput): Promise<SignInAdminOutput> {
    const admin = await this.adminUserRepository.findByEmail(normalizeEmail(input.email));

    const isPasswordValid = admin
      ? await admin.password.matches(input.password)
      : await simulatePasswordCheck(input.password);

    if (!admin || !isPasswordValid || !admin.canSignIn) {
      throw new InvalidCredentialsException();
    }

    return { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
  }
}

export interface SignInAdminInput {
  email: string;
  password: string;
}

export interface SignInAdminOutput {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}
