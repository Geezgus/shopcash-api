import type { UseCase } from '@shared/application/usecase.js';
import { InvalidCredentialsException } from '@shared/domain/exceptions/auth.exceptions.js';
import { simulatePasswordCheck } from '@shared/domain/value-objects/password.js';
import { normalizeEmail } from '@shared/validation.js';
import { RefreshToken } from '@platform/users/domain/entities/refresh-token.js';
import type { RefreshTokenRepository } from '@platform/users/domain/repositories/refresh-token.repository.js';
import type { UserRepository } from '@platform/users/domain/repositories/user.repository.js';

export class SignInUseCase implements UseCase<SignInInput, SignInOutput> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(input: SignInInput): Promise<SignInOutput> {
    const user = await this.userRepository.findByEmail(normalizeEmail(input.email));

    const isPasswordValid = user
      ? await user.password.matches(input.password)
      : await simulatePasswordCheck(input.password);

    if (!user || !isPasswordValid || !user.canSignIn) {
      throw new InvalidCredentialsException();
    }

    const { refreshToken, token } = RefreshToken.issue(user.id, input.refreshTokenTtlSeconds);
    await this.refreshTokenRepository.save(refreshToken);

    return {
      user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
      refreshToken: { token, expiresAt: refreshToken.expiresAt },
    };
  }
}

export interface SignInInput {
  email: string;
  password: string;
  refreshTokenTtlSeconds: number;
}

export interface SignInOutput {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  refreshToken: {
    token: string;
    expiresAt: Date;
  };
}
