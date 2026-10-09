import type { EntityManager } from 'typeorm';
import { User } from '@platform/users/domain/entities/user.js';
import { UserNotFoundException } from '@platform/users/domain/exceptions/user.exceptions.js';
import type { UserRepository } from '@platform/users/domain/repositories/user.repository.js';
import { restorePassword } from '@shared/domain/value-objects/password.js';
import { UserEntity } from '../entities/user.entity.js';

export class UserTypeOrmRepository implements UserRepository {
  constructor(private readonly manager: EntityManager) {}

  async getById(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new UserNotFoundException({ id });
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.manager.findOneBy(UserEntity, { user_id: id });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.manager.findOneBy(UserEntity, { email });
    return entity ? this.toDomain(entity) : null;
  }

  exists(id: string): Promise<boolean> {
    return this.manager.existsBy(UserEntity, { user_id: id });
  }

  existsByEmail(email: string): Promise<boolean> {
    return this.manager.existsBy(UserEntity, { email });
  }

  async save(user: User): Promise<User> {
    await this.manager.save(this.toEntity(user));
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.manager.delete(UserEntity, { user_id: id });
  }

  private toDomain(entity: UserEntity): User {
    return User.restore(entity.user_id, {
      name: entity.name,
      email: entity.email,
      avatarUrl: entity.avatar_url,
      isActive: entity.is_active,
      isVerified: entity.is_verified,
      password: restorePassword(entity.password_algorithm, entity.password_hash, entity.password_salt),
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
      deletedAt: entity.deleted_at,
    });
  }

  private toEntity(user: User): UserEntity {
    return this.manager.create(UserEntity, {
      user_id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatarUrl,
      is_active: user.isActive,
      is_verified: user.isVerified,
      password_hash: user.password.value,
      password_salt: user.password.salt,
      password_algorithm: user.password.algorithm,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      deleted_at: user.deletedAt,
    });
  }
}
