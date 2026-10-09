import {
  AbstractBadRequestException,
  AbstractConflictException,
  AbstractNotFoundException,
  AbstractUnauthorizedException,
  AbstractValidationException,
} from '@shared/domain/exceptions/app.exceptions.js';

export class UserAlreadyExistsException extends AbstractConflictException {
  readonly code = 'USER_ALREADY_EXISTS';

  constructor(context?: Record<string, unknown>) {
    super('User with email already exists', context);
  }
}

export class UserNotFoundException extends AbstractNotFoundException {
  readonly code = 'USER_NOT_FOUND';

  constructor(context?: Record<string, unknown>) {
    super('User not found', context);
  }
}

export class RefreshTokenNotFoundException extends AbstractNotFoundException {
  readonly code = 'REFRESH_TOKEN_NOT_FOUND';

  constructor(context?: Record<string, unknown>) {
    super('Refresh token not found', context);
  }
}

export class ResetPasswordTokenNotFoundException extends AbstractNotFoundException {
  readonly code = 'RESET_PASSWORD_TOKEN_NOT_FOUND';

  constructor(context?: Record<string, unknown>) {
    super('Reset password token not found', context);
  }
}

export class InvalidRefreshTokenException extends AbstractUnauthorizedException {
  readonly code = 'INVALID_REFRESH_TOKEN';

  constructor(context?: Record<string, unknown>) {
    super('Invalid or expired refresh token', context);
  }
}

export class InvalidResetPasswordTokenException extends AbstractBadRequestException {
  readonly code = 'INVALID_RESET_PASSWORD_TOKEN';

  constructor(context?: Record<string, unknown>) {
    super('Invalid or expired reset password token', context);
  }
}

export class InvalidAvatarUrlException extends AbstractValidationException {
  readonly code = 'INVALID_AVATAR_URL';

  constructor(message = 'Invalid avatar URL format', context?: Record<string, unknown>) {
    super(message, context);
  }
}
