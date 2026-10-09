import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { uuidv7 } from 'uuidv7';
import {
  AdminTokenValidator,
  type AuthenticatedAdmin,
} from '@admin/auth/application/services/admin-token-validator.js';
import { AdminRole } from '@admin/auth/domain/types/admin-role.js';
import { AdminRoles } from '@admin/auth/infra/http/decorators/admin-roles.decorator.js';
import { AdminAuthGuard } from '@admin/auth/infra/http/guards/admin-auth.guard.js';
import { Public } from '@shared/infra/http/decorators/public.decorator.js';

class Routes {
  @Public()
  open() {}

  any() {}

  @AdminRoles(AdminRole.SUPER_ADMIN)
  superAdminOnly() {}
}

function contextFor(handler: keyof Routes, authorization?: string) {
  const request: Record<string, any> = { headers: { authorization } };
  const context = {
    getHandler: () => Routes.prototype[handler],
    getClass: () => Routes,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

function guardFor(role: AdminRole) {
  const admin: AuthenticatedAdmin = { id: uuidv7(), name: 'Admin', email: 'admin@example.com', role };
  const validator: AdminTokenValidator = { validateToken: async () => admin };
  return { guard: new AdminAuthGuard(validator, new Reflector()), admin };
}

describe('AdminAuthGuard', () => {
  it('lets public routes through without a token', async () => {
    const { guard } = guardFor(AdminRole.ADMIN);

    await expect(guard.canActivate(contextFor('open').context)).resolves.toBe(true);
  });

  it('requires a bearer token', async () => {
    const { guard } = guardFor(AdminRole.ADMIN);

    await expect(guard.canActivate(contextFor('any').context)).rejects.toThrow(UnauthorizedException);
    await expect(guard.canActivate(contextFor('any', 'Basic abc').context)).rejects.toThrow(UnauthorizedException);
  });

  it('exposes the admin on the request', async () => {
    const { guard, admin } = guardFor(AdminRole.ADMIN);
    const { context, request } = contextFor('any', 'Bearer token');

    await guard.canActivate(context);

    expect(request.admin).toBe(admin);
  });

  it('enforces @AdminRoles, always letting SUPER_ADMIN through', async () => {
    await expect(
      guardFor(AdminRole.ADMIN).guard.canActivate(contextFor('superAdminOnly', 'Bearer token').context),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      guardFor(AdminRole.SUPER_ADMIN).guard.canActivate(contextFor('superAdminOnly', 'Bearer token').context),
    ).resolves.toBe(true);
  });
});
