/**
 * Validates a plain-text password against a policy, throwing a WeakPasswordException when it does not comply.
 */
export abstract class PasswordPolicyValidator {
  abstract validate(password: string): void;
}
