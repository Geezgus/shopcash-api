/**
 * Back-office roles. SUPER_ADMIN can do everything; extend this list with the roles your back-office needs.
 */
export const AdminRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
} as const;

export type AdminRole = (typeof AdminRole)[keyof typeof AdminRole];
