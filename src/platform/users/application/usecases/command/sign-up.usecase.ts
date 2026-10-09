import type { EventDispatcher } from '@shared/application/services/event-dispatcher.js';
import type { UseCase } from '@shared/application/usecase.js';
import type { PasswordPolicyValidator } from '@shared/domain/services/password-policy-validator.js';
import { createPassword } from '@shared/domain/value-objects/password.js';
import { normalizeEmail } from '@shared/validation.js';
import { User } from '@platform/users/domain/entities/user.js';
import { UserAlreadyExistsException } from '@platform/users/domain/exceptions/user.exceptions.js';
import type { UserRepository } from '@platform/users/domain/repositories/user.repository.js';

export class SignUpUseCase implements UseCase<SignUpInput, SignUpOutput> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventDispatcher: EventDispatcher,
    private readonly passwordPolicyValidator?: PasswordPolicyValidator,
  ) {}

  async execute(input: SignUpInput): Promise<SignUpOutput> {
    const email = normalizeEmail(input.email);
    if (await this.userRepository.existsByEmail(email)) {
      throw new UserAlreadyExistsException({ email });
    }

    const user = User.create(input.name, email, await createPassword(input.password, this.passwordPolicyValidator));
    await this.userRepository.save(user);
    await this.eventDispatcher.dispatchAll(user.pullEvents());

    return { id: user.id, name: user.name, email: user.email };
  }
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface SignUpOutput {
  id: string;
  name: string;
  email: string;
}
