import type { EntityManager } from 'typeorm';
import { ApiKey } from '@platform/api-keys/domain/entities/api-key.js';
import { ApiKeyNotFoundException } from '@platform/api-keys/domain/exceptions/api-key.exceptions.js';
import type { ApiKeyRepository } from '@platform/api-keys/domain/repositories/api-key.repository.js';
import { ApiKeyEntity } from '../entities/api-key.entity.js';

export class ApiKeyTypeOrmRepository implements ApiKeyRepository {
  constructor(private readonly manager: EntityManager) {}

  async getById(id: string): Promise<ApiKey> {
    const apiKey = await this.findById(id);
    if (!apiKey) throw new ApiKeyNotFoundException({ id });
    return apiKey;
  }

  async findById(id: string): Promise<ApiKey | null> {
    const entity = await this.manager.findOneBy(ApiKeyEntity, { api_key_id: id });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<ApiKey[]> {
    const entities = await this.manager.find(ApiKeyEntity, { order: { created_at: 'DESC' } });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByKeyHash(keyHash: string): Promise<ApiKey | null> {
    const entity = await this.manager.findOneBy(ApiKeyEntity, { key_hash: keyHash });
    return entity ? this.toDomain(entity) : null;
  }

  exists(id: string): Promise<boolean> {
    return this.manager.existsBy(ApiKeyEntity, { api_key_id: id });
  }

  async save(apiKey: ApiKey): Promise<ApiKey> {
    await this.manager.save(
      this.manager.create(ApiKeyEntity, {
        api_key_id: apiKey.id,
        name: apiKey.name,
        key_prefix: apiKey.keyPrefix,
        key_hash: apiKey.keyHash,
        is_active: apiKey.isActive,
        last_used_at: apiKey.lastUsedAt,
        created_by: apiKey.createdBy,
        created_at: apiKey.createdAt,
        updated_at: apiKey.updatedAt,
      }),
    );
    return apiKey;
  }

  async delete(id: string): Promise<void> {
    await this.manager.delete(ApiKeyEntity, { api_key_id: id });
  }

  private toDomain(entity: ApiKeyEntity): ApiKey {
    return ApiKey.restore(entity.api_key_id, {
      name: entity.name,
      keyPrefix: entity.key_prefix,
      keyHash: entity.key_hash,
      isActive: entity.is_active,
      lastUsedAt: entity.last_used_at,
      createdBy: entity.created_by,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    });
  }
}
