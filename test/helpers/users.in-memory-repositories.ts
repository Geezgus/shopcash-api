import type { RefreshToken } from '@platform/users/domain/entities/refresh-token.js';
import type { ResetPasswordToken } from '@platform/users/domain/entities/reset-password-token.js';
import type { User } from '@platform/users/domain/entities/user.js';
import {
  RefreshTokenNotFoundException,
  ResetPasswordTokenNotFoundException,
  UserNotFoundException,
} from '@platform/users/domain/exceptions/user.exceptions.js';
import type { RefreshTokenRepository } from '@platform/users/domain/repositories/refresh-token.repository.js';
import type { ResetPasswordTokenRepository } from '@platform/users/domain/repositories/reset-password-token.repository.js';
import type { UserRepository } from '@platform/users/domain/repositories/user.repository.js';
import { InMemoryRepository } from './in-memory-repository.js';

export class UserInMemoryRepository extends InMemoryRepository<User> implements UserRepository {
  protected notFound(id: string) {
    return new UserNotFoundException({ id });
  }

  async findByEmail(email: string) {
    return this.find((user) => user.email === email);
  }

  async existsByEmail(email: string) {
    return this.find((user) => user.email === email) !== null;
  }
}

export class RefreshTokenInMemoryRepository extends InMemoryRepository<RefreshToken> implements RefreshTokenRepository {
  protected notFound(id: string) {
    return new RefreshTokenNotFoundException({ id });
  }

  async findByTokenHash(tokenHash: string) {
    return this.find((token) => token.tokenHash === tokenHash);
  }

  async revokeAllByUserId(userId: string) {
    for (const token of this.items.values()) {
      if (token.userId === userId) token.revoke();
    }
  }
}

export class ResetPasswordTokenInMemoryRepository
  extends InMemoryRepository<ResetPasswordToken>
  implements ResetPasswordTokenRepository
{
  protected notFound(id: string) {
    return new ResetPasswordTokenNotFoundException({ id });
  }

  async findByTokenHash(tokenHash: string) {
    return this.find((token) => token.tokenHash === tokenHash);
  }
}
