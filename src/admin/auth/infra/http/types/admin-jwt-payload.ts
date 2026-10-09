import type { AdminRole } from '@admin/auth/domain/types/admin-role.js';

export interface AdminJwtPayload {
  /** Admin user id. */
  sub: string;
  role: AdminRole;
}
