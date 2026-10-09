import type { EntityManager } from 'typeorm';
import { AdminUser } from '@admin/auth/domain/entities/admin-user.js';
import { AdminUserNotFoundException } from '@admin/auth/domain/exceptions/admin-user.exceptions.js';
import type { AdminUserRepository } from '@admin/auth/domain/repositories/admin-user.repository.js';
import { restorePassword } from '@shared/domain/value-objects/password.js';
import { AdminUserEntity } from '../entities/admin-user.entity.js';

export class AdminUserTypeOrmRepository implements AdminUserRepository {
  constructor(private readonly manager: EntityManager) {}

  async getById(id: string): Promise<AdminUser> {
    const admin = await this.findById(id);
    if (!admin) throw new AdminUserNotFoundException({ id });
    return admin;
  }

  async findById(id: string): Promise<AdminUser | null> {
    const entity = await this.manager.findOneBy(AdminUserEntity, { admin_user_id: id });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<AdminUser | null> {
    const entity = await this.manager.findOneBy(AdminUserEntity, { email });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<AdminUser[]> {
    const entities = await this.manager.find(AdminUserEntity, { order: { created_at: 'DESC' } });
    return entities.map((entity) => this.toDomain(entity));
  }

  exists(id: string): Promise<boolean> {
    return this.manager.existsBy(AdminUserEntity, { admin_user_id: id });
  }

  existsByEmail(email: string): Promise<boolean> {
    return this.manager.existsBy(AdminUserEntity, { email });
  }

  async save(admin: AdminUser): Promise<AdminUser> {
    await this.manager.save(
      this.manager.create(AdminUserEntity, {
        admin_user_id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        is_active: admin.isActive,
        password_hash: admin.password.value,
        password_salt: admin.password.salt,
        password_algorithm: admin.password.algorithm,
        created_at: admin.createdAt,
        updated_at: admin.updatedAt,
        deleted_at: admin.deletedAt,
      }),
    );
    return admin;
  }

  async delete(id: string): Promise<void> {
    await this.manager.delete(AdminUserEntity, { admin_user_id: id });
  }

  private toDomain(entity: AdminUserEntity): AdminUser {
    return AdminUser.restore(entity.admin_user_id, {
      name: entity.name,
      email: entity.email,
      password: restorePassword(entity.password_algorithm, entity.password_hash, entity.password_salt),
      role: entity.role,
      isActive: entity.is_active,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
      deletedAt: entity.deleted_at,
    });
  }
}
