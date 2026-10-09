import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AdminTokenValidator } from '@admin/auth/application/services/admin-token-validator.js';
import { AdminRole } from '@admin/auth/domain/types/admin-role.js';
import { extractBearerToken } from '@shared/infra/http/bearer-token.js';
import { IS_PUBLIC_KEY } from '@shared/infra/http/decorators/public.decorator.js';
import { ADMIN_ROLES_KEY } from '../decorators/admin-roles.decorator.js';

/**
 * Authenticates admins through a bearer access token, enforces `@AdminRoles()` and exposes the admin as
 * `request.admin`. Apply it at controller level and opt routes out with `@Public()`.
 */
@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly tokenValidator: AdminTokenValidator,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = extractBearerToken(request);
    if (!token) throw new UnauthorizedException('Missing bearer token');

    const admin = await this.tokenValidator.validateToken(token);
    request.admin = admin;

    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[] | undefined>(ADMIN_ROLES_KEY, targets);
    if (requiredRoles?.length && admin.role !== AdminRole.SUPER_ADMIN && !requiredRoles.includes(admin.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
