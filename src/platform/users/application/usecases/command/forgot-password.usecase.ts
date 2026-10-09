import type { EventDispatcher } from '@shared/application/services/event-dispatcher.js';
import type { UseCase } from '@shared/application/usecase.js';
import { normalizeEmail } from '@shared/validation.js';
import { ResetPasswordToken } from '@platform/users/domain/entities/reset-password-token.js';
import { PasswordResetRequestedEvent } from '@platform/users/domain/events/password-reset-requested.event.js';
import type { ResetPasswordTokenRepository } from '@platform/users/domain/repositories/reset-password-token.repository.js';
import type { UserRepository } from '@platform/users/domain/repositories/user.repository.js';

/**
 * Issues a reset password token and raises an event so it can be delivered (e.g. by e-mail).
 * It completes silently for unknown e-mails, so callers cannot discover which e-mails are registered.
 */
export class ForgotPasswordUseCase implements UseCase<ForgotPasswordInput, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly resetPasswordTokenRepository: ResetPasswordTokenRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(input: ForgotPasswordInput): Promise<void> {
    const user = await this.userRepository.findByEmail(normalizeEmail(input.email));
    if (!user?.canSignIn) return;

    const { resetPasswordToken, token } = ResetPasswordToken.issue(user.id);
    await this.resetPasswordTokenRepository.save(resetPasswordToken);

    await this.eventDispatcher.dispatch(
      new PasswordResetRequestedEvent(user.id, user.name, user.email, token, resetPasswordToken.expiresAt),
    );
  }
}

export interface ForgotPasswordInput {
  email: string;
}
