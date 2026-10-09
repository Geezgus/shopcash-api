import { AbstractNotFoundException } from '@shared/domain/exceptions/app.exceptions.js';

export class ApiKeyNotFoundException extends AbstractNotFoundException {
  readonly code = 'API_KEY_NOT_FOUND';

  constructor(context?: Record<string, unknown>) {
    super('API key not found', context);
  }
}
