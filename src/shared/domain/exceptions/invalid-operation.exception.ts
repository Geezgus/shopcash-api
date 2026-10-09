import { AbstractUnprocessableEntityException } from './app.exceptions.js';

/**
 * The operation is not allowed in the current state of the resource.
 */
export class InvalidOperationException extends AbstractUnprocessableEntityException {
  readonly code = 'INVALID_OPERATION';

  constructor(message?: string, context?: Record<string, unknown>) {
    super(message ?? 'Invalid operation', context);
  }
}
