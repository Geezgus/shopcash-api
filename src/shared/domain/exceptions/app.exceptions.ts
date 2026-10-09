/**
 * Base class for every exception the application throws on purpose.
 * The HTTP layer maps each abstract subclass below to a status code (see AllExceptionsFilter).
 *
 * `code` is a stable, machine-readable identifier; `context` carries data the client can use to build a message.
 */
export abstract class AbstractDomainException extends Error {
  abstract readonly code: string;
  readonly context?: Record<string, unknown>;

  constructor(message?: string, context?: Record<string, unknown>) {
    super(message);
    this.name = new.target.name;
    this.context = context;
  }
}

/** 400 - The request is malformed or carries invalid data. */
export abstract class AbstractBadRequestException extends AbstractDomainException {}

/** 401 - I can't determine who you are, you need to authenticate first. */
export abstract class AbstractUnauthorizedException extends AbstractDomainException {}

/** 403 - I know who you are, but you don't have permission to perform this action. */
export abstract class AbstractForbiddenException extends AbstractDomainException {}

/** 404 - I can't find the resource you are looking for. */
export abstract class AbstractNotFoundException extends AbstractDomainException {}

/** 409 - The request conflicts with the current state of the resource. */
export abstract class AbstractConflictException extends AbstractDomainException {}

/** 422 - The request is well-formed, but the operation is not allowed in the resource's current state. */
export abstract class AbstractUnprocessableEntityException extends AbstractDomainException {}

/** 400 - A value has the right type but is out of the allowed range or format. */
export abstract class AbstractValidationException extends AbstractBadRequestException {}

export class ValidationException extends AbstractValidationException {
  readonly code = 'VALIDATION_ERROR';

  constructor(message?: string, context?: Record<string, unknown>) {
    super(message ?? 'Validation error', context);
  }
}
