import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  type ChangePasswordInput,
  ChangePasswordUseCase,
} from '@platform/users/application/usecases/command/change-password.usecase.js';
import {
  type ForgotPasswordInput,
  ForgotPasswordUseCase,
} from '@platform/users/application/usecases/command/forgot-password.usecase.js';
import { RefreshSessionUseCase } from '@platform/users/application/usecases/command/refresh-session.usecase.js';
import {
  type ResetPasswordInput,
  ResetPasswordUseCase,
} from '@platform/users/application/usecases/command/reset-password.usecase.js';
import { type SignInOutput, SignInUseCase } from '@platform/users/application/usecases/command/sign-in.usecase.js';
import { type SignOutInput, SignOutUseCase } from '@platform/users/application/usecases/command/sign-out.usecase.js';
import { type SignUpInput, SignUpUseCase } from '@platform/users/application/usecases/command/sign-up.usecase.js';
import { type GetMeInput, GetMeUseCase } from '@platform/users/application/usecases/query/get-me.usecase.js';
import { EventDispatcher } from '@shared/application/services/event-dispatcher.js';
import { PasswordPolicyValidator } from '@shared/domain/services/password-policy-validator.js';
import { TypeOrmUnitOfWork } from '@shared/infra/database/typeorm-unit-of-work.js';
import { JwtAudience } from '@shared/infra/http/jwt-audience.js';
import { env } from '@/env.js';
import { RefreshTokenTypeOrmRepository } from '../database/repositories/refresh-token.typeorm-repository.js';
import { ResetPasswordTokenTypeOrmRepository } from '../database/repositories/reset-password-token.typeorm-repository.js';
import { UserTypeOrmRepository } from '../database/repositories/user.typeorm-repository.js';
import type { UserJwtPayload } from '../http/types/user-jwt-payload.js';

export interface Session {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
  user: SignInOutput['user'];
}

/**
 * Wires the users use cases to their infrastructure: transactions, repositories and token signing.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly unitOfWork: TypeOrmUnitOfWork,
    private readonly jwtService: JwtService,
    private readonly eventDispatcher: EventDispatcher,
    private readonly passwordPolicyValidator: PasswordPolicyValidator,
  ) {}

  signUp(input: SignUpInput) {
    return this.unitOfWork.execute((manager) =>
      new SignUpUseCase(new UserTypeOrmRepository(manager), this.eventDispatcher, this.passwordPolicyValidator).execute(
        input,
      ),
    );
  }

  async signIn(input: { email: string; password: string }): Promise<Session> {
    const output = await this.unitOfWork.execute((manager) =>
      new SignInUseCase(new UserTypeOrmRepository(manager), new RefreshTokenTypeOrmRepository(manager)).execute({
        ...input,
        refreshTokenTtlSeconds: env.REFRESH_TOKEN_TTL_SECONDS,
      }),
    );
    return this.createSession(output);
  }

  async refreshSession(input: { refreshToken: string }): Promise<Session> {
    const output = await this.unitOfWork.execute((manager) =>
      new RefreshSessionUseCase(new RefreshTokenTypeOrmRepository(manager), new UserTypeOrmRepository(manager)).execute(
        { ...input, refreshTokenTtlSeconds: env.REFRESH_TOKEN_TTL_SECONDS },
      ),
    );
    return this.createSession(output);
  }

  signOut(input: SignOutInput) {
    return this.unitOfWork.execute((manager) =>
      new SignOutUseCase(new RefreshTokenTypeOrmRepository(manager)).execute(input),
    );
  }

  forgotPassword(input: ForgotPasswordInput) {
    return this.unitOfWork.execute((manager) =>
      new ForgotPasswordUseCase(
        new UserTypeOrmRepository(manager),
        new ResetPasswordTokenTypeOrmRepository(manager),
        this.eventDispatcher,
      ).execute(input),
    );
  }

  resetPassword(input: ResetPasswordInput) {
    return this.unitOfWork.execute((manager) =>
      new ResetPasswordUseCase(
        new UserTypeOrmRepository(manager),
        new ResetPasswordTokenTypeOrmRepository(manager),
        new RefreshTokenTypeOrmRepository(manager),
        this.eventDispatcher,
        this.passwordPolicyValidator,
      ).execute(input),
    );
  }

  changePassword(input: ChangePasswordInput) {
    return this.unitOfWork.execute((manager) =>
      new ChangePasswordUseCase(
        new UserTypeOrmRepository(manager),
        this.eventDispatcher,
        this.passwordPolicyValidator,
      ).execute(input),
    );
  }

  getMe(input: GetMeInput) {
    return this.unitOfWork.execute((manager) => new GetMeUseCase(new UserTypeOrmRepository(manager)).execute(input));
  }

  private async createSession(output: SignInOutput): Promise<Session> {
    const payload: UserJwtPayload = { sub: output.user.id };
    const accessToken = await this.jwtService.signAsync(payload, {
      audience: JwtAudience.PLATFORM,
      expiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
    });
    return {
      accessToken,
      accessTokenExpiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
      refreshToken: output.refreshToken.token,
      refreshTokenExpiresAt: output.refreshToken.expiresAt,
      user: output.user,
    };
  }
}
