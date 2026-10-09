import { type EntityManager, IsNull } from 'typeorm';
import { RefreshToken } from '@platform/users/domain/entities/refresh-token.js';
import { RefreshTokenNotFoundException } from '@platform/users/domain/exceptions/user.exceptions.js';
import type { RefreshTokenRepository } from '@platform/users/domain/repositories/refresh-token.repository.js';
import { RefreshTokenEntity } from '../entities/refresh-token.entity.js';

export class RefreshTokenTypeOrmRepository implements RefreshTokenRepository {
  constructor(private readonly manager: EntityManager) {}

  async getById(id: string): Promise<RefreshToken> {
    const refreshToken = await this.findById(id);
    if (!refreshToken) throw new RefreshTokenNotFoundException({ id });
    return refreshToken;
  }

  async findById(id: string): Promise<RefreshToken | null> {
    const entity = await this.manager.findOneBy(RefreshTokenEntity, { refresh_token_id: id });
    return entity ? this.toDomain(entity) : null;
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const entity = await this.manager.findOneBy(RefreshTokenEntity, { token_hash: tokenHash });
    return entity ? this.toDomain(entity) : null;
  }

  exists(id: string): Promise<boolean> {
    return this.manager.existsBy(RefreshTokenEntity, { refresh_token_id: id });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.manager.update(
      RefreshTokenEntity,
      { user_id: userId, revoked_at: IsNull() },
      { revoked_at: new Date() },
    );
  }

  async save(refreshToken: RefreshToken): Promise<RefreshToken> {
    await this.manager.save(
      this.manager.create(RefreshTokenEntity, {
        refresh_token_id: refreshToken.id,
        user_id: refreshToken.userId,
        token_hash: refreshToken.tokenHash,
        expires_at: refreshToken.expiresAt,
        revoked_at: refreshToken.revokedAt,
        created_at: refreshToken.createdAt,
      }),
    );
    return refreshToken;
  }

  async delete(id: string): Promise<void> {
    await this.manager.delete(RefreshTokenEntity, { refresh_token_id: id });
  }

  private toDomain(entity: RefreshTokenEntity): RefreshToken {
    return RefreshToken.restore(entity.refresh_token_id, {
      userId: entity.user_id,
      tokenHash: entity.token_hash,
      expiresAt: entity.expires_at,
      revokedAt: entity.revoked_at,
      createdAt: entity.created_at,
    });
  }
}
