import type { Repository } from '@shared/domain/repository.js';
import type { User } from '../entities/user.js';

export interface UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
}
