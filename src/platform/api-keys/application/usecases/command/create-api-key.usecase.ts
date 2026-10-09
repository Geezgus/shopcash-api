import { ApiKey } from '@platform/api-keys/domain/entities/api-key.js';
import type { ApiKeyRepository } from '@platform/api-keys/domain/repositories/api-key.repository.js';
import type { UseCase } from '@shared/application/usecase.js';

export class CreateApiKeyUseCase implements UseCase<CreateApiKeyInput, CreateApiKeyOutput> {
  constructor(private readonly apiKeyRepository: ApiKeyRepository) {}

  async execute(input: CreateApiKeyInput): Promise<CreateApiKeyOutput> {
    const { apiKey, key } = ApiKey.issue(input.name, input.createdBy);
    await this.apiKeyRepository.save(apiKey);
    return { id: apiKey.id, name: apiKey.name, key, createdAt: apiKey.createdAt };
  }
}

export interface CreateApiKeyInput {
  name: string;
  /** Id of the admin user creating the key. */
  createdBy: string;
}

export interface CreateApiKeyOutput {
  id: string;
  name: string;
  /** The plain-text key. It is only returned here and cannot be retrieved later. */
  key: string;
  createdAt: Date;
}
