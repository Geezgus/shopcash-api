import { randomBytes, scrypt, type ScryptOptions, timingSafeEqual } from 'node:crypto';
import { InvalidArgumentException } from '@shared/domain/exceptions/invalid-argument.exception.js';
import type { PasswordPolicyValidator } from '@shared/domain/services/password-policy-validator.js';

export const PasswordAlgorithm = {
  SCRYPT: 'scrypt',
} as const;

export type PasswordAlgorithm = (typeof PasswordAlgorithm)[keyof typeof PasswordAlgorithm];

/**
 * A hashed password. The plain text is never stored.
 * `algorithm` is persisted alongside the hash so the hashing scheme can evolve without breaking existing users.
 */
export interface Password {
  readonly value: string;
  readonly salt: string;
  readonly algorithm: PasswordAlgorithm;
  matches(plainText: string): Promise<boolean>;
}

// One of the OWASP-recommended scrypt configurations (N=2^15, r=8, p=3), using 32 MiB per hash.
// Hashing is async so it runs on libuv's thread pool instead of blocking the event loop.
const SCRYPT_OPTIONS: ScryptOptions = { N: 2 ** 15, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const SCRYPT_KEY_LENGTH = 64;

function scryptAsync(plainText: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(plainText.normalize('NFKC'), salt, SCRYPT_KEY_LENGTH, SCRYPT_OPTIONS, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

export class ScryptPassword implements Password {
  readonly algorithm = PasswordAlgorithm.SCRYPT;

  private constructor(
    readonly value: string,
    readonly salt: string,
  ) {}

  static async create(plainText: string): Promise<ScryptPassword> {
    const salt = randomBytes(16).toString('hex');
    const hash = await scryptAsync(plainText, salt);
    return new ScryptPassword(hash.toString('hex'), salt);
  }

  static restore(value: string, salt: string): ScryptPassword {
    return new ScryptPassword(value, salt);
  }

  async matches(plainText: string): Promise<boolean> {
    const expected = Buffer.from(this.value, 'hex');
    const actual = await scryptAsync(plainText, this.salt);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }
}

export async function createPassword(plainText: string, policy?: PasswordPolicyValidator): Promise<Password> {
  if (!plainText) {
    throw new InvalidArgumentException('Password is required');
  }
  policy?.validate(plainText);
  return ScryptPassword.create(plainText);
}

export function restorePassword(algorithm: string, value: string, salt: string): Password {
  if (algorithm === PasswordAlgorithm.SCRYPT) {
    return ScryptPassword.restore(value, salt);
  }
  throw new InvalidArgumentException(`Unsupported password algorithm: ${algorithm}`);
}

let dummyPassword: Promise<Password> | undefined;

/**
 * Spends the same time as a real password check. Call it when the user does not exist,
 * so response times do not reveal which e-mails are registered.
 */
export async function simulatePasswordCheck(plainText: string): Promise<false> {
  dummyPassword ??= ScryptPassword.create('dummy-password');
  await (await dummyPassword).matches(plainText);
  return false;
}
