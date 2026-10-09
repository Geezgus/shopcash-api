import { SignInUseCase } from '@platform/users/application/usecases/command/sign-in.usecase.js';
import { User } from '@platform/users/domain/entities/user.js';
import { hashToken } from '@shared/crypto.js';
import { InvalidCredentialsException } from '@shared/domain/exceptions/auth.exceptions.js';
import { createPassword } from '@shared/domain/value-objects/password.js';
import { RefreshTokenInMemoryRepository, UserInMemoryRepository } from '../../helpers/users.in-memory-repositories.js';

describe('SignInUseCase', () => {
  let users: UserInMemoryRepository;
  let refreshTokens: RefreshTokenInMemoryRepository;
  let useCase: SignInUseCase;
  let user: User;

  beforeEach(async () => {
    users = new UserInMemoryRepository();
    refreshTokens = new RefreshTokenInMemoryRepository();
    useCase = new SignInUseCase(users, refreshTokens);
    user = await users.save(User.create('John', 'john@example.com', await createPassword('S3cret!pass')));
  });

  it('signs in with valid credentials and stores only the refresh token hash', async () => {
    const output = await useCase.execute({
      email: 'John@Example.com',
      password: 'S3cret!pass',
      refreshTokenTtlSeconds: 60,
    });

    expect(output.user.id).toBe(user.id);
    const [stored] = refreshTokens.items.values();
    expect(stored.tokenHash).toBe(hashToken(output.refreshToken.token));
    expect(stored.tokenHash).not.toBe(output.refreshToken.token);
  });

  it.each([
    ['a wrong password', 'john@example.com', 'Wrong!pass1'],
    ['an unknown e-mail', 'nobody@example.com', 'S3cret!pass'],
  ])('rejects %s with the same error', async (_, email, password) => {
    await expect(useCase.execute({ email, password, refreshTokenTtlSeconds: 60 })).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('rejects inactive users', async () => {
    user.deactivate();

    await expect(
      useCase.execute({ email: 'john@example.com', password: 'S3cret!pass', refreshTokenTtlSeconds: 60 }),
    ).rejects.toThrow(InvalidCredentialsException);
  });
});
