import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { TokenValidator } from '@platform/users/application/services/token-validator.js';
import { extractBearerToken } from '@shared/infra/http/bearer-token.js';
import { IS_PUBLIC_KEY } from '@shared/infra/http/decorators/public.decorator.js';

/**
 * Authenticates platform users through a bearer access token and exposes them as `request.user`.
 * Apply it at controller level and opt routes out with `@Public()`.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenValidator: TokenValidator,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = extractBearerToken(request);
    if (!token) throw new UnauthorizedException('Missing bearer token');

    request.user = await this.tokenValidator.validateToken(token);
    return true;
  }
}
