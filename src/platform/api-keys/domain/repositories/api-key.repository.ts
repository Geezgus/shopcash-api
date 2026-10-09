import type { Repository } from '@shared/domain/repository.js';
import type { ApiKey } from '../entities/api-key.js';

export interface ApiKeyRepository extends Repository<ApiKey> {
  findAll(): Promise<ApiKey[]>;
  findByKeyHash(keyHash: string): Promise<ApiKey | null>;
}
