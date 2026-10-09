import { uuidv7 } from 'uuidv7';
import { AggregateRoot } from '@shared/domain/aggregate-root.js';
import { InvalidArgumentException } from '@shared/domain/exceptions/invalid-argument.exception.js';
import { InvalidOperationException } from '@shared/domain/exceptions/invalid-operation.exception.js';
import type { Password } from '@shared/domain/value-objects/password.js';
import { normalizeEmail, validateEmail } from '@shared/validation.js';
import { AdminRole } from '../types/admin-role.js';

export interface AdminUserProps {
  name: string;
  email: string;
  password: Password;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class AdminUser extends AggregateRoot {
  private readonly _name: string;
  private readonly _email: string;
  private readonly _password: Password;
  private readonly _role: AdminRole;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private readonly _deletedAt: Date | null;

  private constructor(id: string, props: AdminUserProps) {
    super(id);

    const name = props.name?.trim();
    const email = normalizeEmail(props.email ?? '');
    if (!name) {
      throw new InvalidArgumentException('Admin user name is required');
    }
    validateEmail(email);
    if (!Object.values(AdminRole).includes(props.role)) {
      throw new InvalidArgumentException(`Invalid admin role: ${props.role}`);
    }

    this._name = name;
    this._email = email;
    this._password = props.password;
    this._role = props.role;
    this._isActive = props.isActive;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._deletedAt = props.deletedAt;
  }

  static create(name: string, email: string, password: Password, role: AdminRole): AdminUser {
    const now = new Date();
    return new AdminUser(uuidv7(), {
      name,
      email,
      password,
      role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  static restore(id: string, props: AdminUserProps): AdminUser {
    return new AdminUser(id, props);
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get password(): Password {
    return this._password;
  }

  get role(): AdminRole {
    return this._role;
  }

  get isActive(): boolean {
    return this._isActive;
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

  /** Whether the admin is allowed to sign in. */
  get canSignIn(): boolean {
    return this._isActive && this._deletedAt === null;
  }

  activate() {
    if (this._isActive) {
      throw new InvalidOperationException('Admin user is already active');
    }
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate() {
    if (!this._isActive) {
      throw new InvalidOperationException('Admin user is already inactive');
    }
    this._isActive = false;
    this._updatedAt = new Date();
  }
}
