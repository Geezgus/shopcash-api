import {
  PasswordDoesNotContainDigitException,
  PasswordDoesNotContainLowercaseException,
  PasswordDoesNotContainSpecialCharacterException,
  PasswordDoesNotContainUppercaseException,
  PasswordIsTooLongException,
  PasswordIsTooShortException,
} from '@shared/domain/exceptions/password-policy.exceptions.js';
import { PasswordPolicyValidator } from '@shared/domain/services/password-policy-validator.js';

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

/**
 * Requires 8-128 characters with at least one uppercase letter, lowercase letter, digit and special character.
 * Swap the PasswordPolicyValidator provider in PasswordPolicyModule to change the policy.
 */
export class DefaultPasswordPolicyValidator extends PasswordPolicyValidator {
  validate(password: string): void {
    if (password.length < MIN_LENGTH) {
      throw new PasswordIsTooShortException(MIN_LENGTH);
    }
    if (password.length > MAX_LENGTH) {
      throw new PasswordIsTooLongException(MAX_LENGTH);
    }
    if (!/[A-Z]/.test(password)) {
      throw new PasswordDoesNotContainUppercaseException();
    }
    if (!/[a-z]/.test(password)) {
      throw new PasswordDoesNotContainLowercaseException();
    }
    if (!/\d/.test(password)) {
      throw new PasswordDoesNotContainDigitException();
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      throw new PasswordDoesNotContainSpecialCharacterException();
    }
  }
}
