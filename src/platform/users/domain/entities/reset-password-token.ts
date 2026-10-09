import { uuidv7 } from 'uuidv7';
import { generateSecureToken, hashToken } from '@shared/crypto.js';
import { DomainEntity } from '@shared/domain/domain-entity.js';
import { InvalidOperationException } from '@shared/domain/exceptions/invalid-operation.exception.js';

export interface ResetPasswordTokenProps {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export const RESET_PASSWORD_TOKEN_TTL_SECONDS = 15 * 60;

/**
 * A single-use token that allows a user to set a new password. Only its hash is stored.
 */
export class ResetPasswordToken extends DomainEntity {
  private readonly _userId: string;
  private readonly _tokenHash: string;
  private readonly _expiresAt: Date;
  private _usedAt: Date | null;
  private readonly _createdAt: Date;

  private constructor(id: string, props: ResetPasswordTokenProps) {
    super(id);
    this._userId = props.userId;
    this._tokenHash = props.tokenHash;
    this._expiresAt = props.expiresAt;
    this._usedAt = props.usedAt;
    this._createdAt = props.createdAt;
  }

  /**
   * Issues a new token. The returned plain-text `token` must be delivered to the user and is not recoverable.
   */
  static issue(
    userId: string,
    ttlSeconds = RESET_PASSWORD_TOKEN_TTL_SECONDS,
  ): { resetPasswordToken: ResetPasswordToken; token: string } {
    const token = generateSecureToken();
    const now = new Date();
    const resetPasswordToken = new ResetPasswordToken(uuidv7(), {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(now.getTime() + ttlSeconds * 1000),
      usedAt: null,
      createdAt: now,
    });
    return { resetPasswordToken, token };
  }

  static restore(id: string, props: ResetPasswordTokenProps): ResetPasswordToken {
    return new ResetPasswordToken(id, props);
  }

  get userId(): string {
    return this._userId;
  }

  get tokenHash(): string {
    return this._tokenHash;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get usedAt(): Date | null {
    return this._usedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get isUsable(): boolean {
    return this._usedAt === null && this._expiresAt > new Date();
  }

  markAsUsed() {
    if (!this.isUsable) {
      throw new InvalidOperationException('Reset password token is no longer usable');
    }
    this._usedAt = new Date();
  }
}
