import type { EventDispatcher } from '@shared/application/services/event-dispatcher.js';
import type { UseCase } from '@shared/application/usecase.js';
import { hashToken } from '@shared/crypto.js';
import type { PasswordPolicyValidator } from '@shared/domain/services/password-policy-validator.js';
import { createPassword } from '@shared/domain/value-objects/password.js';
import { InvalidResetPasswordTokenException } from '@platform/users/domain/exceptions/user.exceptions.js';
import type { RefreshTokenRepository } from '@platform/users/domain/repositories/refresh-token.repository.js';
import type { ResetPasswordTokenRepository } from '@platform/users/domain/repositories/reset-password-token.repository.js';
import type { UserRepository } from '@platform/users/domain/repositories/user.repository.js';

/**
 * Sets a new password using a reset token, then signs the user out of every session.
 */
export class ResetPasswordUseCase implements UseCase<ResetPasswordInput, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly resetPasswordTokenRepository: ResetPasswordTokenRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly eventDispatcher: EventDispatcher,
    private readonly passwordPolicyValidator?: PasswordPolicyValidator,
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    const resetPasswordToken = await this.resetPasswordTokenRepository.findByTokenHash(hashToken(input.token));
    if (!resetPasswordToken?.isUsable) {
      throw new InvalidResetPasswordTokenException();
    }

    const user = await this.userRepository.findById(resetPasswordToken.userId);
    if (!user?.canSignIn) {
      throw new InvalidResetPasswordTokenException();
    }

    user.resetPassword(await createPassword(input.newPassword, this.passwordPolicyValidator));
    resetPasswordToken.markAsUsed();

    await this.userRepository.save(user);
    await this.resetPasswordTokenRepository.save(resetPasswordToken);
    await this.refreshTokenRepository.revokeAllByUserId(user.id);
    await this.eventDispatcher.dispatchAll(user.pullEvents());
  }
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}
