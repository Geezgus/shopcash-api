import type { UseCase } from '@shared/application/usecase.js';
import { hashToken } from '@shared/crypto.js';
import type { RefreshTokenRepository } from '@platform/users/domain/repositories/refresh-token.repository.js';

/**
 * Revokes a refresh token. Idempotent: unknown or already revoked tokens are ignored.
 */
export class SignOutUseCase implements UseCase<SignOutInput, void> {
  constructor(private readonly refreshTokenRepository: RefreshTokenRepository) {}

  async execute(input: SignOutInput): Promise<void> {
    const refreshToken = await this.refreshTokenRepository.findByTokenHash(hashToken(input.refreshToken));
    if (!refreshToken || refreshToken.revokedAt) return;

    refreshToken.revoke();
    await this.refreshTokenRepository.save(refreshToken);
  }
}

export interface SignOutInput {
  refreshToken: string;
}
