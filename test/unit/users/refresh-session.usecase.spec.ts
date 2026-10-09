import { RefreshSessionUseCase } from '@platform/users/application/usecases/command/refresh-session.usecase.js';
import { RefreshToken } from '@platform/users/domain/entities/refresh-token.js';
import { User } from '@platform/users/domain/entities/user.js';
import { InvalidRefreshTokenException } from '@platform/users/domain/exceptions/user.exceptions.js';
import { createPassword } from '@shared/domain/value-objects/password.js';
import { RefreshTokenInMemoryRepository, UserInMemoryRepository } from '../../helpers/users.in-memory-repositories.js';

describe('RefreshSessionUseCase', () => {
  let users: UserInMemoryRepository;
  let refreshTokens: RefreshTokenInMemoryRepository;
  let useCase: RefreshSessionUseCase;
  let user: User;

  beforeEach(async () => {
    users = new UserInMemoryRepository();
    refreshTokens = new RefreshTokenInMemoryRepository();
    useCase = new RefreshSessionUseCase(refreshTokens, users);
    user = await users.save(User.create('John', 'john@example.com', await createPassword('S3cret!pass')));
  });

  async function issue(ttlSeconds = 60) {
    const { refreshToken, token } = RefreshToken.issue(user.id, ttlSeconds);
    await refreshTokens.save(refreshToken);
    return token;
  }

  it('rotates the refresh token', async () => {
    const token = await issue();

    const output = await useCase.execute({ refreshToken: token, refreshTokenTtlSeconds: 60 });

    expect(output.refreshToken.token).not.toBe(token);
    await expect(useCase.execute({ refreshToken: token, refreshTokenTtlSeconds: 60 })).rejects.toThrow(
      InvalidRefreshTokenException,
    );
    await expect(
      useCase.execute({ refreshToken: output.refreshToken.token, refreshTokenTtlSeconds: 60 }),
    ).resolves.toBeDefined();
  });

  it('rejects unknown and expired tokens', async () => {
    vi.useFakeTimers();
    try {
      const token = await issue(60);
      vi.advanceTimersByTime(61_000);

      await expect(useCase.execute({ refreshToken: token, refreshTokenTtlSeconds: 60 })).rejects.toThrow(
        InvalidRefreshTokenException,
      );
      await expect(useCase.execute({ refreshToken: 'unknown', refreshTokenTtlSeconds: 60 })).rejects.toThrow(
        InvalidRefreshTokenException,
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects tokens of users who can no longer sign in', async () => {
    const token = await issue();
    user.deactivate();

    await expect(useCase.execute({ refreshToken: token, refreshTokenTtlSeconds: 60 })).rejects.toThrow(
      InvalidRefreshTokenException,
    );
  });
});
