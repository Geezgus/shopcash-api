import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  type AuthenticatedApiKey,
  ApiKeyValidator,
} from '@platform/api-keys/application/services/api-key-validator.js';
import { hashToken } from '@shared/crypto.js';
import { DATA_SOURCE } from '@shared/infra/database/database.tokens.js';
import { ApiKeyTypeOrmRepository } from '../database/repositories/api-key.typeorm-repository.js';

@Injectable()
export class ApiKeyValidatorService extends ApiKeyValidator {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {
    super();
  }

  async validate(key: string): Promise<AuthenticatedApiKey | null> {
    const repository = new ApiKeyTypeOrmRepository(this.dataSource.manager);
    const apiKey = await repository.findByKeyHash(hashToken(key));
    if (!apiKey?.isActive) return null;

    apiKey.markAsUsed();
    await repository.save(apiKey);

    return { id: apiKey.id, name: apiKey.name };
  }
}
