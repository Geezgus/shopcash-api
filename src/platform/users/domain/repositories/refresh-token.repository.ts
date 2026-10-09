import type { Repository } from '@shared/domain/repository.js';
import type { RefreshToken } from '../entities/refresh-token.js';

export interface RefreshTokenRepository extends Repository<RefreshToken> {
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  revokeAllByUserId(userId: string): Promise<void>;
}
