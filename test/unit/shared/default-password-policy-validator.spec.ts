import {
  PasswordDoesNotContainDigitException,
  PasswordDoesNotContainLowercaseException,
  PasswordDoesNotContainSpecialCharacterException,
  PasswordDoesNotContainUppercaseException,
  PasswordIsTooLongException,
  PasswordIsTooShortException,
} from '@shared/domain/exceptions/password-policy.exceptions.js';
import { DefaultPasswordPolicyValidator } from '@shared/infra/services/default-password-policy-validator.js';

describe('DefaultPasswordPolicyValidator', () => {
  const validator = new DefaultPasswordPolicyValidator();

  it('accepts a compliant password', () => {
    expect(() => validator.validate('Str0ng!Pass')).not.toThrow();
  });

  it.each([
    ['Sh0rt!', PasswordIsTooShortException],
    [`A1!${'a'.repeat(130)}`, PasswordIsTooLongException],
    ['str0ng!pass', PasswordDoesNotContainUppercaseException],
    ['STR0NG!PASS', PasswordDoesNotContainLowercaseException],
    ['Strong!Pass', PasswordDoesNotContainDigitException],
    ['Str0ngPass', PasswordDoesNotContainSpecialCharacterException],
  ])('rejects %s', (password, exception) => {
    expect(() => validator.validate(password)).toThrow(exception);
  });
});
