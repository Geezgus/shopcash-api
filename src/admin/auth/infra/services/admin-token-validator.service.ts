import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import {
  AdminTokenValidator,
  type AuthenticatedAdmin,
} from '@admin/auth/application/services/admin-token-validator.js';
import { DATA_SOURCE } from '@shared/infra/database/database.tokens.js';
import { JwtAudience } from '@shared/infra/http/jwt-audience.js';
import { AdminUserTypeOrmRepository } from '../database/repositories/admin-user.typeorm-repository.js';
import type { AdminJwtPayload } from '../http/types/admin-jwt-payload.js';

@Injectable()
export class AdminTokenValidatorService extends AdminTokenValidator {
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  async validateToken(token: string): Promise<AuthenticatedAdmin> {
    const payload = await this.jwtService.verifyAsync<AdminJwtPayload>(token, { audience: JwtAudience.ADMIN });

    // Load the admin on every request so deactivation and role changes take effect immediately.
    const admin = await new AdminUserTypeOrmRepository(this.dataSource.manager).findById(payload.sub);
    if (!admin?.canSignIn) {
      throw new UnauthorizedException('Admin user is inactive or no longer exists');
    }

    return { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
  }
}
