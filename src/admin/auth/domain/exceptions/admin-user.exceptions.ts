import { AbstractConflictException, AbstractNotFoundException } from '@shared/domain/exceptions/app.exceptions.js';

export class AdminUserAlreadyExistsException extends AbstractConflictException {
  readonly code = 'ADMIN_USER_ALREADY_EXISTS';

  constructor(context?: Record<string, unknown>) {
    super('Admin user with email already exists', context);
  }
}

export class AdminUserNotFoundException extends AbstractNotFoundException {
  readonly code = 'ADMIN_USER_NOT_FOUND';

  constructor(context?: Record<string, unknown>) {
    super('Admin user not found', context);
  }
}
