import type { UseCase } from '@shared/application/usecase.js';
import { hashToken } from '@shared/crypto.js';
import { RefreshToken } from '@platform/users/domain/entities/refresh-token.js';
import { InvalidRefreshTokenException } from '@platform/users/domain/exceptions/user.exceptions.js';
import type { RefreshTokenRepository } from '@platform/users/domain/repositories/refresh-token.repository.js';
import type { UserRepository } from '@platform/users/domain/repositories/user.repository.js';

/**
 * Exchanges a refresh token for a new one (rotation). The presented token is revoked and cannot be reused.
 */
export class RefreshSessionUseCase implements UseCase<RefreshSessionInput, RefreshSessionOutput> {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: RefreshSessionInput): Promise<RefreshSessionOutput> {
    const current = await this.refreshTokenRepository.findByTokenHash(hashToken(input.refreshToken));
    if (!current?.isActive) {
      throw new InvalidRefreshTokenException();
    }

    const user = await this.userRepository.findById(current.userId);
    if (!user?.canSignIn) {
      throw new InvalidRefreshTokenException();
    }

    current.revoke();
    await this.refreshTokenRepository.save(current);

    const { refreshToken, token } = RefreshToken.issue(user.id, input.refreshTokenTtlSeconds);
    await this.refreshTokenRepository.save(refreshToken);

    return {
      user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
      refreshToken: { token, expiresAt: refreshToken.expiresAt },
    };
  }
}

export interface RefreshSessionInput {
  refreshToken: string;
  refreshTokenTtlSeconds: number;
}

export interface RefreshSessionOutput {
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
