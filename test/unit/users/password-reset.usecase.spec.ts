import { ForgotPasswordUseCase } from '@platform/users/application/usecases/command/forgot-password.usecase.js';
import { ResetPasswordUseCase } from '@platform/users/application/usecases/command/reset-password.usecase.js';
import { RefreshToken } from '@platform/users/domain/entities/refresh-token.js';
import { User } from '@platform/users/domain/entities/user.js';
import { PasswordChangedEvent } from '@platform/users/domain/events/password-changed.event.js';
import { PasswordResetRequestedEvent } from '@platform/users/domain/events/password-reset-requested.event.js';
import { InvalidResetPasswordTokenException } from '@platform/users/domain/exceptions/user.exceptions.js';
import { createPassword } from '@shared/domain/value-objects/password.js';
import { FakeEventDispatcher } from '../../helpers/fake-event-dispatcher.js';
import {
  RefreshTokenInMemoryRepository,
  ResetPasswordTokenInMemoryRepository,
  UserInMemoryRepository,
} from '../../helpers/users.in-memory-repositories.js';

describe('Password reset', () => {
  let users: UserInMemoryRepository;
  let resetTokens: ResetPasswordTokenInMemoryRepository;
  let refreshTokens: RefreshTokenInMemoryRepository;
  let events: FakeEventDispatcher;
  let forgotPassword: ForgotPasswordUseCase;
  let resetPassword: ResetPasswordUseCase;
  let user: User;

  beforeEach(async () => {
    users = new UserInMemoryRepository();
    resetTokens = new ResetPasswordTokenInMemoryRepository();
    refreshTokens = new RefreshTokenInMemoryRepository();
    events = new FakeEventDispatcher();
    forgotPassword = new ForgotPasswordUseCase(users, resetTokens, events);
    resetPassword = new ResetPasswordUseCase(users, resetTokens, refreshTokens, events);
    user = await users.save(User.create('John', 'john@example.com', await createPassword('S3cret!pass')));
    user.pullEvents();
  });

  async function requestToken() {
    await forgotPassword.execute({ email: 'john@example.com' });
    const [event] = events.ofType(PasswordResetRequestedEvent);
    return event.token;
  }

  it('silently ignores unknown e-mails', async () => {
    await forgotPassword.execute({ email: 'nobody@example.com' });

    expect(events.dispatched).toEqual([]);
    expect(resetTokens.items.size).toBe(0);
  });

  it('delivers the token through an event and stores only its hash', async () => {
    const token = await requestToken();

    const [stored] = resetTokens.items.values();
    expect(stored.tokenHash).not.toBe(token);
  });

  it('resets the password, consumes the token and revokes every session', async () => {
    const { refreshToken } = RefreshToken.issue(user.id, 60);
    await refreshTokens.save(refreshToken);
    const token = await requestToken();

    await resetPassword.execute({ token, newPassword: 'N3w!pass' });

    expect(await user.password.matches('N3w!pass')).toBe(true);
    expect(refreshToken.isActive).toBe(false);
    expect(events.ofType(PasswordChangedEvent)).toHaveLength(1);
    await expect(resetPassword.execute({ token, newPassword: 'An0ther!pass' })).rejects.toThrow(
      InvalidResetPasswordTokenException,
    );
  });

  it('rejects expired tokens', async () => {
    vi.useFakeTimers();
    try {
      const token = await requestToken();
      vi.advanceTimersByTime(16 * 60 * 1000);

      await expect(resetPassword.execute({ token, newPassword: 'N3w!pass' })).rejects.toThrow(
        InvalidResetPasswordTokenException,
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
