import type { ApiKeyRepository } from '@platform/api-keys/domain/repositories/api-key.repository.js';
import type { UseCase } from '@shared/application/usecase.js';

export class DeactivateApiKeyUseCase implements UseCase<DeactivateApiKeyInput, void> {
  constructor(private readonly apiKeyRepository: ApiKeyRepository) {}

  async execute(input: DeactivateApiKeyInput): Promise<void> {
    const apiKey = await this.apiKeyRepository.getById(input.id);
    apiKey.deactivate();
    await this.apiKeyRepository.save(apiKey);
  }
}

export interface DeactivateApiKeyInput {
  id: string;
}
