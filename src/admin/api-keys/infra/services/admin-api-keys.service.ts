import { Injectable } from '@nestjs/common';
import {
  type CreateApiKeyInput,
  CreateApiKeyUseCase,
} from '@platform/api-keys/application/usecases/command/create-api-key.usecase.js';
import {
  type DeactivateApiKeyInput,
  DeactivateApiKeyUseCase,
} from '@platform/api-keys/application/usecases/command/deactivate-api-key.usecase.js';
import {
  type DeleteApiKeyInput,
  DeleteApiKeyUseCase,
} from '@platform/api-keys/application/usecases/command/delete-api-key.usecase.js';
import { ListApiKeysUseCase } from '@platform/api-keys/application/usecases/query/list-api-keys.usecase.js';
import { ApiKeyTypeOrmRepository } from '@platform/api-keys/infra/database/repositories/api-key.typeorm-repository.js';
import { TypeOrmUnitOfWork } from '@shared/infra/database/typeorm-unit-of-work.js';

@Injectable()
export class AdminApiKeysService {
  constructor(private readonly unitOfWork: TypeOrmUnitOfWork) {}

  list() {
    return this.unitOfWork.execute((manager) => new ListApiKeysUseCase(new ApiKeyTypeOrmRepository(manager)).execute());
  }

  create(input: CreateApiKeyInput) {
    return this.unitOfWork.execute((manager) =>
      new CreateApiKeyUseCase(new ApiKeyTypeOrmRepository(manager)).execute(input),
    );
  }

  deactivate(input: DeactivateApiKeyInput) {
    return this.unitOfWork.execute((manager) =>
      new DeactivateApiKeyUseCase(new ApiKeyTypeOrmRepository(manager)).execute(input),
    );
  }

  delete(input: DeleteApiKeyInput) {
    return this.unitOfWork.execute((manager) =>
      new DeleteApiKeyUseCase(new ApiKeyTypeOrmRepository(manager)).execute(input),
    );
  }
}
