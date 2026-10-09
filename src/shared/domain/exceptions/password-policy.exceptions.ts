import { AbstractBadRequestException } from './app.exceptions.js';

export abstract class WeakPasswordException extends AbstractBadRequestException {}

export class PasswordDoesNotContainUppercaseException extends WeakPasswordException {
  readonly code = 'PASSWORD_DOES_NOT_CONTAIN_UPPERCASE';

  constructor(context?: Record<string, unknown>) {
    super('The password should contain at least one uppercase letter', context);
  }
}

export class PasswordDoesNotContainLowercaseException extends WeakPasswordException {
  readonly code = 'PASSWORD_DOES_NOT_CONTAIN_LOWERCASE';

  constructor(context?: Record<string, unknown>) {
    super('The password should contain at least one lowercase letter', context);
  }
}

export class PasswordDoesNotContainDigitException extends WeakPasswordException {
  readonly code = 'PASSWORD_DOES_NOT_CONTAIN_DIGIT';

  constructor(context?: Record<string, unknown>) {
    super('The password should contain at least one digit', context);
  }
}

export class PasswordDoesNotContainSpecialCharacterException extends WeakPasswordException {
  readonly code = 'PASSWORD_DOES_NOT_CONTAIN_SPECIAL_CHARACTER';

  constructor(context?: Record<string, unknown>) {
    super('The password should contain at least one special character', context);
  }
}

export class PasswordIsTooShortException extends WeakPasswordException {
  readonly code = 'PASSWORD_IS_TOO_SHORT';

  constructor(minLength: number, context?: Record<string, unknown>) {
    super(`The password should be at least ${minLength} characters in length`, { minLength, ...context });
  }
}

export class PasswordIsTooLongException extends WeakPasswordException {
  readonly code = 'PASSWORD_IS_TOO_LONG';

  constructor(maxLength: number, context?: Record<string, unknown>) {
    super(`The password should be at most ${maxLength} characters in length`, { maxLength, ...context });
  }
}
