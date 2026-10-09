import { User } from '@platform/users/domain/entities/user.js';
import { PasswordChangedEvent } from '@platform/users/domain/events/password-changed.event.js';
import { UserSignedUpEvent } from '@platform/users/domain/events/user-signed-up.event.js';
import { IncorrectPasswordException } from '@shared/domain/exceptions/auth.exceptions.js';
import { InvalidArgumentException } from '@shared/domain/exceptions/invalid-argument.exception.js';
import { InvalidOperationException } from '@shared/domain/exceptions/invalid-operation.exception.js';
import { ValidationException } from '@shared/domain/exceptions/app.exceptions.js';
import { createPassword } from '@shared/domain/value-objects/password.js';

describe('User', () => {
  it('normalizes data and raises UserSignedUpEvent on creation', async () => {
    const user = User.create('  John  ', ' John@Example.com ', await createPassword('S3cret!pass'));

    expect(user.name).toBe('John');
    expect(user.email).toBe('john@example.com');
    expect(user.canSignIn).toBe(true);
    expect(user.pullEvents()).toEqual([expect.any(UserSignedUpEvent)]);
    expect(user.pullEvents()).toEqual([]);
  });

  it('rejects invalid data', async () => {
    const password = await createPassword('S3cret!pass');

    expect(() => User.create(' ', 'john@example.com', password)).toThrow(InvalidArgumentException);
    expect(() => User.create('John', 'not-an-email', password)).toThrow(ValidationException);
  });

  it('changes the password only when the current one matches', async () => {
    const user = User.create('John', 'john@example.com', await createPassword('S3cret!pass'));
    user.pullEvents();

    await expect(user.changePassword('wrong', await createPassword('N3w!pass'))).rejects.toThrow(
      IncorrectPasswordException,
    );
    await expect(user.changePassword('S3cret!pass', await createPassword('S3cret!pass'))).rejects.toThrow(
      InvalidOperationException,
    );

    await user.changePassword('S3cret!pass', await createPassword('N3w!pass'));

    expect(await user.password.matches('N3w!pass')).toBe(true);
    expect(user.pullEvents()).toEqual([expect.any(PasswordChangedEvent)]);
  });

  it('cannot sign in once deactivated or archived', async () => {
    const user = User.create('John', 'john@example.com', await createPassword('S3cret!pass'));

    user.deactivate();
    expect(user.canSignIn).toBe(false);

    user.activate();
    user.archive();
    expect(user.canSignIn).toBe(false);
  });
});
