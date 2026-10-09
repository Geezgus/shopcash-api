import { AbstractUnauthorizedException } from './app.exceptions.js';

export class InvalidCredentialsException extends AbstractUnauthorizedException {
  readonly code = 'INVALID_CREDENTIALS';

  constructor(context?: Record<string, unknown>) {
    super('Invalid email or password', context);
  }
}

export class IncorrectPasswordException extends AbstractUnauthorizedException {
  readonly code = 'INCORRECT_PASSWORD';

  constructor(context?: Record<string, unknown>) {
    super('Incorrect password', context);
  }
}
