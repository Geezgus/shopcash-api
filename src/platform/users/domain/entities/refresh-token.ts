import { uuidv7 } from 'uuidv7';
import { generateSecureToken, hashToken } from '@shared/crypto.js';
import { DomainEntity } from '@shared/domain/domain-entity.js';

export interface RefreshTokenProps {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

/**
 * A long-lived session token used to obtain new access tokens. Only its hash is stored.
 */
export class RefreshToken extends DomainEntity {
  private readonly _userId: string;
  private readonly _tokenHash: string;
  private readonly _expiresAt: Date;
  private _revokedAt: Date | null;
  private readonly _createdAt: Date;

  private constructor(id: string, props: RefreshTokenProps) {
    super(id);
    this._userId = props.userId;
    this._tokenHash = props.tokenHash;
    this._expiresAt = props.expiresAt;
    this._revokedAt = props.revokedAt;
    this._createdAt = props.createdAt;
  }

  /**
   * Issues a new refresh token. The returned plain-text `token` must be sent to the client and is not recoverable.
   */
  static issue(userId: string, ttlSeconds: number): { refreshToken: RefreshToken; token: string } {
    const token = generateSecureToken();
    const now = new Date();
    const refreshToken = new RefreshToken(uuidv7(), {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(now.getTime() + ttlSeconds * 1000),
      revokedAt: null,
      createdAt: now,
    });
    return { refreshToken, token };
  }

  static restore(id: string, props: RefreshTokenProps): RefreshToken {
    return new RefreshToken(id, props);
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

  get revokedAt(): Date | null {
    return this._revokedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get isActive(): boolean {
    return this._revokedAt === null && this._expiresAt > new Date();
  }

  revoke() {
    this._revokedAt ??= new Date();
  }
}
