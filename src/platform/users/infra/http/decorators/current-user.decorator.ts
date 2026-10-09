import { createParamDecorator, type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '@platform/users/application/services/token-validator.js';

/**
 * Injects the user authenticated by AuthGuard.
 */
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthenticatedUser => {
  const { user } = ctx.switchToHttp().getRequest<Request>();
  if (!user) throw new UnauthorizedException();
  return user;
});
