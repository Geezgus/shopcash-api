import { ApiKeyNotFoundException } from '@platform/api-keys/domain/exceptions/api-key.exceptions.js';
import type { ApiKeyRepository } from '@platform/api-keys/domain/repositories/api-key.repository.js';
import type { UseCase } from '@shared/application/usecase.js';

export class DeleteApiKeyUseCase implements UseCase<DeleteApiKeyInput, void> {
  constructor(private readonly apiKeyRepository: ApiKeyRepository) {}

  async execute(input: DeleteApiKeyInput): Promise<void> {
    if (!(await this.apiKeyRepository.exists(input.id))) {
      throw new ApiKeyNotFoundException({ id: input.id });
    }
    await this.apiKeyRepository.delete(input.id);
  }
}

export interface DeleteApiKeyInput {
  id: string;
}
