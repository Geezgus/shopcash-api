import type { Repository } from '@shared/domain/repository.js';
import type { AdminUser } from '../entities/admin-user.js';

export interface AdminUserRepository extends Repository<AdminUser> {
  findByEmail(email: string): Promise<AdminUser | null>;
  existsByEmail(email: string): Promise<boolean>;
  findAll(): Promise<AdminUser[]>;
}
