import type { AdminRole } from '@admin/auth/domain/types/admin-role.js';

export interface AuthenticatedAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

/**
 * Validates an admin access token and resolves the admin it was issued to.
 */
export abstract class AdminTokenValidator {
  abstract validateToken(token: string): Promise<AuthenticatedAdmin>;
}
