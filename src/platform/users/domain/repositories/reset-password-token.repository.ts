import type { Repository } from '@shared/domain/repository.js';
import type { ResetPasswordToken } from '../entities/reset-password-token.js';

export interface ResetPasswordTokenRepository extends Repository<ResetPasswordToken> {
  findByTokenHash(tokenHash: string): Promise<ResetPasswordToken | null>;
}
