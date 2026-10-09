import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  type CreateAdminUserInput,
  CreateAdminUserUseCase,
} from '@admin/auth/application/usecases/command/create-admin-user.usecase.js';
import {
  type SignInAdminInput,
  SignInAdminUseCase,
} from '@admin/auth/application/usecases/command/sign-in-admin.usecase.js';
import { ListAdminUsersUseCase } from '@admin/auth/application/usecases/query/list-admin-users.usecase.js';
import { PasswordPolicyValidator } from '@shared/domain/services/password-policy-validator.js';
import { TypeOrmUnitOfWork } from '@shared/infra/database/typeorm-unit-of-work.js';
import { JwtAudience } from '@shared/infra/http/jwt-audience.js';
import { env } from '@/env.js';
import { AdminUserTypeOrmRepository } from '../database/repositories/admin-user.typeorm-repository.js';
import type { AdminJwtPayload } from '../http/types/admin-jwt-payload.js';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly unitOfWork: TypeOrmUnitOfWork,
    private readonly jwtService: JwtService,
    private readonly passwordPolicyValidator: PasswordPolicyValidator,
  ) {}

  async signIn(input: SignInAdminInput) {
    const admin = await this.unitOfWork.execute((manager) =>
      new SignInAdminUseCase(new AdminUserTypeOrmRepository(manager)).execute(input),
    );
    const payload: AdminJwtPayload = { sub: admin.id, role: admin.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      audience: JwtAudience.ADMIN,
      expiresIn: env.ADMIN_ACCESS_TOKEN_TTL_SECONDS,
    });
    return { accessToken, accessTokenExpiresIn: env.ADMIN_ACCESS_TOKEN_TTL_SECONDS, admin };
  }

  createAdminUser(input: CreateAdminUserInput) {
    return this.unitOfWork.execute((manager) =>
      new CreateAdminUserUseCase(new AdminUserTypeOrmRepository(manager), this.passwordPolicyValidator).execute(input),
    );
  }

  listAdminUsers() {
    return this.unitOfWork.execute((manager) =>
      new ListAdminUsersUseCase(new AdminUserTypeOrmRepository(manager)).execute(),
    );
  }
}
