import { SignUpUseCase } from '@platform/users/application/usecases/command/sign-up.usecase.js';
import { UserSignedUpEvent } from '@platform/users/domain/events/user-signed-up.event.js';
import { UserAlreadyExistsException } from '@platform/users/domain/exceptions/user.exceptions.js';
import { PasswordIsTooShortException } from '@shared/domain/exceptions/password-policy.exceptions.js';
import { DefaultPasswordPolicyValidator } from '@shared/infra/services/default-password-policy-validator.js';
import { FakeEventDispatcher } from '../../helpers/fake-event-dispatcher.js';
import { UserInMemoryRepository } from '../../helpers/users.in-memory-repositories.js';

describe('SignUpUseCase', () => {
  let users: UserInMemoryRepository;
  let events: FakeEventDispatcher;
  let useCase: SignUpUseCase;

  beforeEach(() => {
    users = new UserInMemoryRepository();
    events = new FakeEventDispatcher();
    useCase = new SignUpUseCase(users, events, new DefaultPasswordPolicyValidator());
  });

  it('creates the user and raises UserSignedUpEvent', async () => {
    const output = await useCase.execute({ name: 'John', email: 'John@Example.com', password: 'S3cret!pass' });

    expect(output).toEqual({ id: expect.any(String), name: 'John', email: 'john@example.com' });
    expect(await users.exists(output.id)).toBe(true);
    expect(events.ofType(UserSignedUpEvent)).toHaveLength(1);
  });

  it('rejects an e-mail that is already registered, ignoring case', async () => {
    await useCase.execute({ name: 'John', email: 'john@example.com', password: 'S3cret!pass' });

    await expect(useCase.execute({ name: 'John', email: 'JOHN@example.com', password: 'S3cret!pass' })).rejects.toThrow(
      UserAlreadyExistsException,
    );
  });

  it('enforces the password policy', async () => {
    await expect(useCase.execute({ name: 'John', email: 'john@example.com', password: 'short' })).rejects.toThrow(
      PasswordIsTooShortException,
    );
  });
});
