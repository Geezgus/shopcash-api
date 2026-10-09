import { SetMetadata } from '@nestjs/common';
import type { AdminRole } from '@admin/auth/domain/types/admin-role.js';

export const ADMIN_ROLES_KEY = 'adminRoles';

/**
 * Restricts a route (or controller) to admins with one of the given roles. SUPER_ADMIN always passes.
 * Enforced by AdminAuthGuard.
 */
export const AdminRoles = (...roles: AdminRole[]) => SetMetadata(ADMIN_ROLES_KEY, roles);
