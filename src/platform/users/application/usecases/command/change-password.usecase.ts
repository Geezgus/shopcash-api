import type { EventDispatcher } from '@shared/application/services/event-dispatcher.js';
import type { UseCase } from '@shared/application/usecase.js';
import type { PasswordPolicyValidator } from '@shared/domain/services/password-policy-validator.js';
import { createPassword } from '@shared/domain/value-objects/password.js';
import type { UserRepository } from '@platform/users/domain/repositories/user.repository.js';

export class ChangePasswordUseCase implements UseCase<ChangePasswordInput, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventDispatcher: EventDispatcher,
    private readonly passwordPolicyValidator?: PasswordPolicyValidator,
  ) {}

  async execute(input: ChangePasswordInput): Promise<void> {
    const user = await this.userRepository.getById(input.userId);
    await user.changePassword(
      input.currentPassword,
      await createPassword(input.newPassword, this.passwordPolicyValidator),
    );
    await this.userRepository.save(user);
    await this.eventDispatcher.dispatchAll(user.pullEvents());
  }
}

export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}
