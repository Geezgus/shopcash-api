import { PasswordAlgorithm, createPassword, restorePassword } from '@shared/domain/value-objects/password.js';
import { InvalidArgumentException } from '@shared/domain/exceptions/invalid-argument.exception.js';
import { PasswordIsTooShortException } from '@shared/domain/exceptions/password-policy.exceptions.js';
import { DefaultPasswordPolicyValidator } from '@shared/infra/services/default-password-policy-validator.js';

describe('Password', () => {
  it('hashes with scrypt and a random salt', async () => {
    const first = await createPassword('S3cret!pass');
    const second = await createPassword('S3cret!pass');

    expect(first.algorithm).toBe(PasswordAlgorithm.SCRYPT);
    expect(first.value).not.toContain('S3cret!pass');
    expect(first.salt).not.toBe(second.salt);
    expect(first.value).not.toBe(second.value);
  });

  it('matches only the original password', async () => {
    const password = await createPassword('S3cret!pass');

    expect(await password.matches('S3cret!pass')).toBe(true);
    expect(await password.matches('S3cret!pasS')).toBe(false);
  });

  it('still matches after being restored from storage', async () => {
    const password = await createPassword('S3cret!pass');
    const restored = restorePassword(password.algorithm, password.value, password.salt);

    expect(await restored.matches('S3cret!pass')).toBe(true);
  });

  it('applies the password policy', async () => {
    await expect(createPassword('Sh0rt!', new DefaultPasswordPolicyValidator())).rejects.toThrow(
      PasswordIsTooShortException,
    );
  });

  it('rejects empty passwords and unknown algorithms', async () => {
    await expect(createPassword('')).rejects.toThrow(InvalidArgumentException);
    expect(() => restorePassword('md5', 'x', 'y')).toThrow(InvalidArgumentException);
  });
});
