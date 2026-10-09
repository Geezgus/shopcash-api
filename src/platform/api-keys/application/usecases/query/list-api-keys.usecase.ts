import type { ApiKeyRepository } from '@platform/api-keys/domain/repositories/api-key.repository.js';
import type { UseCase } from '@shared/application/usecase.js';

export class ListApiKeysUseCase implements UseCase<void, ListApiKeysOutput> {
  constructor(private readonly apiKeyRepository: ApiKeyRepository) {}

  async execute(): Promise<ListApiKeysOutput> {
    const apiKeys = await this.apiKeyRepository.findAll();
    return apiKeys.map((apiKey) => ({
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      isActive: apiKey.isActive,
      lastUsedAt: apiKey.lastUsedAt,
      createdBy: apiKey.createdBy,
      createdAt: apiKey.createdAt,
    }));
  }
}

export type ListApiKeysOutput = {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt: Date | null;
  createdBy: string;
  createdAt: Date;
}[];
