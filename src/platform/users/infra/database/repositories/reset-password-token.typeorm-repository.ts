import type { EntityManager } from 'typeorm';
import { ResetPasswordToken } from '@platform/users/domain/entities/reset-password-token.js';
import { ResetPasswordTokenNotFoundException } from '@platform/users/domain/exceptions/user.exceptions.js';
import type { ResetPasswordTokenRepository } from '@platform/users/domain/repositories/reset-password-token.repository.js';
import { ResetPasswordTokenEntity } from '../entities/reset-password-token.entity.js';

export class ResetPasswordTokenTypeOrmRepository implements ResetPasswordTokenRepository {
  constructor(private readonly manager: EntityManager) {}

  async getById(id: string): Promise<ResetPasswordToken> {
    const token = await this.findById(id);
    if (!token) throw new ResetPasswordTokenNotFoundException({ id });
    return token;
  }

  async findById(id: string): Promise<ResetPasswordToken | null> {
    const entity = await this.manager.findOneBy(ResetPasswordTokenEntity, { reset_password_token_id: id });
    return entity ? this.toDomain(entity) : null;
  }

  async findByTokenHash(tokenHash: string): Promise<ResetPasswordToken | null> {
    const entity = await this.manager.findOneBy(ResetPasswordTokenEntity, { token_hash: tokenHash });
    return entity ? this.toDomain(entity) : null;
  }

  exists(id: string): Promise<boolean> {
    return this.manager.existsBy(ResetPasswordTokenEntity, { reset_password_token_id: id });
  }

  async save(token: ResetPasswordToken): Promise<ResetPasswordToken> {
    await this.manager.save(
      this.manager.create(ResetPasswordTokenEntity, {
        reset_password_token_id: token.id,
        user_id: token.userId,
        token_hash: token.tokenHash,
        expires_at: token.expiresAt,
        used_at: token.usedAt,
        created_at: token.createdAt,
      }),
    );
    return token;
  }

  async delete(id: string): Promise<void> {
    await this.manager.delete(ResetPasswordTokenEntity, { reset_password_token_id: id });
  }

  private toDomain(entity: ResetPasswordTokenEntity): ResetPasswordToken {
    return ResetPasswordToken.restore(entity.reset_password_token_id, {
      userId: entity.user_id,
      tokenHash: entity.token_hash,
      expiresAt: entity.expires_at,
      usedAt: entity.used_at,
      createdAt: entity.created_at,
    });
  }
}
