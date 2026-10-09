import { uuidv7 } from 'uuidv7';
import { generateSecureToken, hashToken } from '@shared/crypto.js';
import { DomainEntity } from '@shared/domain/domain-entity.js';
import { InvalidArgumentException } from '@shared/domain/exceptions/invalid-argument.exception.js';
import { InvalidOperationException } from '@shared/domain/exceptions/invalid-operation.exception.js';

export const API_KEY_PREFIX = 'sk_';

export interface ApiKeyProps {
  name: string;
  /** First characters of the key, kept in clear so a key can be recognized in listings. */
  keyPrefix: string;
  keyHash: string;
  isActive: boolean;
  lastUsedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A credential for external systems to call the API. Only the hash of the key is stored.
 */
export class ApiKey extends DomainEntity {
  private readonly _name: string;
  private readonly _keyPrefix: string;
  private readonly _keyHash: string;
  private _isActive: boolean;
  private _lastUsedAt: Date | null;
  private readonly _createdBy: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(id: string, props: ApiKeyProps) {
    super(id);

    const name = props.name?.trim();
    if (!name) {
      throw new InvalidArgumentException('API key name is required');
    }

    this._name = name;
    this._keyPrefix = props.keyPrefix;
    this._keyHash = props.keyHash;
    this._isActive = props.isActive;
    this._lastUsedAt = props.lastUsedAt;
    this._createdBy = props.createdBy;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  /**
   * Issues a new key. The returned plain-text `key` must be shown to the caller once and is not recoverable.
   */
  static issue(name: string, createdBy: string): { apiKey: ApiKey; key: string } {
    const key = `${API_KEY_PREFIX}${generateSecureToken()}`;
    const now = new Date();
    const apiKey = new ApiKey(uuidv7(), {
      name,
      keyPrefix: key.slice(0, API_KEY_PREFIX.length + 6),
      keyHash: hashToken(key),
      isActive: true,
      lastUsedAt: null,
      createdBy,
      createdAt: now,
      updatedAt: now,
    });
    return { apiKey, key };
  }

  static restore(id: string, props: ApiKeyProps): ApiKey {
    return new ApiKey(id, props);
  }

  get name(): string {
    return this._name;
  }

  get keyPrefix(): string {
    return this._keyPrefix;
  }

  get keyHash(): string {
    return this._keyHash;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get lastUsedAt(): Date | null {
    return this._lastUsedAt;
  }

  get createdBy(): string {
    return this._createdBy;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  deactivate() {
    if (!this._isActive) {
      throw new InvalidOperationException('API key is already inactive');
    }
    this._isActive = false;
    this._updatedAt = new Date();
  }

  markAsUsed() {
    this._lastUsedAt = new Date();
  }
}
