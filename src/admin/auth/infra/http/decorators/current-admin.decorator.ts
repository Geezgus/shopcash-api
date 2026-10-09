import { createParamDecorator, type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedAdmin } from '@admin/auth/application/services/admin-token-validator.js';

/**
 * Injects the admin authenticated by AdminAuthGuard.
 */
export const CurrentAdmin = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthenticatedAdmin => {
  const { admin } = ctx.switchToHttp().getRequest<Request>();
  if (!admin) throw new UnauthorizedException();
  return admin;
});
