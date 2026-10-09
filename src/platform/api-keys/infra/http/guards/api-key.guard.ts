import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { ApiKeyValidator } from '@platform/api-keys/application/services/api-key-validator.js';

export const API_KEY_HEADER = 'x-api-key';

/**
 * Authenticates external systems through the `x-api-key` header and exposes the key as `request.apiKey`.
 * Import ApiKeysModule and use `@UseGuards(ApiKeyGuard)` on routes meant for machine-to-machine calls.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyValidator: ApiKeyValidator) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const key = request.headers[API_KEY_HEADER];
    if (typeof key !== 'string' || !key) {
      throw new UnauthorizedException('Missing API key');
    }

    const apiKey = await this.apiKeyValidator.validate(key);
    if (!apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    request.apiKey = apiKey;
    return true;
  }
}
