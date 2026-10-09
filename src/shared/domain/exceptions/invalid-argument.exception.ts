import { AbstractBadRequestException } from './app.exceptions.js';

/**
 * An argument is missing or invalid (undefined, empty, NaN...).
 */
export class InvalidArgumentException extends AbstractBadRequestException {
  readonly code = 'INVALID_ARGUMENT';

  constructor(message?: string, context?: Record<string, unknown>) {
    super(message ?? 'Invalid argument', context);
  }
}
