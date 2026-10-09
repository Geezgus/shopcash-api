import { uuidv7 } from 'uuidv7';
import * as z from 'zod';
import { AggregateRoot } from '@shared/domain/aggregate-root.js';
import { IncorrectPasswordException } from '@shared/domain/exceptions/auth.exceptions.js';
import { InvalidArgumentException } from '@shared/domain/exceptions/invalid-argument.exception.js';
import { InvalidOperationException } from '@shared/domain/exceptions/invalid-operation.exception.js';
import type { Password } from '@shared/domain/value-objects/password.js';
import {
  normalizeEmail,
  validateCreatedAt,
  validateDeletedAt,
  validateEmail,
  validateUpdatedAt,
} from '@shared/validation.js';
import { PasswordChangedEvent } from '../events/password-changed.event.js';
import { UserSignedUpEvent } from '../events/user-signed-up.event.js';
import { InvalidAvatarUrlException } from '../exceptions/user.exceptions.js';

export interface UserProps {
  name: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
  isVerified: boolean;
  password: Password;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class User extends AggregateRoot {
  private _name: string;
  private _email: string;
  private _avatarUrl: string | null;
  private _isActive: boolean;
  private _isVerified: boolean;
  private _password: Password;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt: Date | null;

  private constructor(id: string, props: UserProps) {
    super(id);

    const name = props.name?.trim();
    const email = normalizeEmail(props.email ?? '');
    const avatarUrl = typeof props.avatarUrl === 'string' ? props.avatarUrl.trim() : null;

    User.validateName(name);
    User.validateAvatarUrl(avatarUrl);
    validateEmail(email);
    validateCreatedAt(props.createdAt);
    validateUpdatedAt(props.updatedAt);
    validateDeletedAt(props.deletedAt);

    if (props.createdAt > props.updatedAt) {
      throw new InvalidArgumentException('createdAt cannot be after updatedAt');
    }

    this._name = name;
    this._email = email;
    this._avatarUrl = avatarUrl;
    this._isActive = props.isActive;
    this._isVerified = props.isVerified;
    this._password = props.password;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._deletedAt = props.deletedAt;
  }

  static create(name: string, email: string, password: Password): User {
    const now = new Date();
    const user = new User(uuidv7(), {
      name,
      email,
      avatarUrl: null,
      isActive: true,
      isVerified: false,
      password,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
    user.addEvent(new UserSignedUpEvent(user.id, user.name, user.email));
    return user;
  }

  static restore(id: string, props: UserProps): User {
    return new User(id, props);
  }

  private static validateName(name: string) {
    if (!name) {
      throw new InvalidArgumentException('User name is required');
    }
  }

  private static validateAvatarUrl(avatarUrl: string | null) {
    if (avatarUrl === null) return;
    if (!z.url().safeParse(avatarUrl).success) {
      throw new InvalidAvatarUrlException();
    }
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get isVerified(): boolean {
    return this._isVerified;
  }

  get password(): Password {
    return this._password;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  /** Whether the user is allowed to sign in. */
  get canSignIn(): boolean {
    return this._isActive && this._deletedAt === null;
  }

  async changePassword(currentPassword: string, newPassword: Password) {
    if (!(await this._password.matches(currentPassword))) {
      throw new IncorrectPasswordException();
    }
    if (await newPassword.matches(currentPassword)) {
      throw new InvalidOperationException('New password must be different from the current password');
    }
    this.setPassword(newPassword);
  }

  resetPassword(newPassword: Password) {
    this.setPassword(newPassword);
  }

  changeAvatarUrl(avatarUrl: string | null) {
    if (avatarUrl === this._avatarUrl) return;
    User.validateAvatarUrl(avatarUrl);
    this._avatarUrl = avatarUrl;
    this.touch();
  }

  verifyEmail() {
    if (this._isVerified) {
      throw new InvalidOperationException('User email is already verified');
    }
    this._isVerified = true;
    this.touch();
  }

  activate() {
    if (this._isActive) {
      throw new InvalidOperationException('User is already active');
    }
    this._isActive = true;
    this.touch();
  }

  deactivate() {
    if (!this._isActive) {
      throw new InvalidOperationException('User is already inactive');
    }
    this._isActive = false;
    this.touch();
  }

  archive() {
    if (this._deletedAt) {
      throw new InvalidOperationException('User is already archived');
    }
    this._deletedAt = new Date();
    this._isActive = false;
    this.touch();
  }

  private setPassword(password: Password) {
    this._password = password;
    this.touch();
    this.addEvent(new PasswordChangedEvent(this.id, this._name, this._email));
  }

  private touch() {
    this._updatedAt = new Date();
  }
}
