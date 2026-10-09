import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { type AuthenticatedUser, TokenValidator } from '@platform/users/application/services/token-validator.js';
import { DATA_SOURCE } from '@shared/infra/database/database.tokens.js';
import { JwtAudience } from '@shared/infra/http/jwt-audience.js';
import { UserTypeOrmRepository } from '../database/repositories/user.typeorm-repository.js';
import type { UserJwtPayload } from '../http/types/user-jwt-payload.js';

@Injectable()
export class TokenValidatorService extends TokenValidator {
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  async validateToken(token: string): Promise<AuthenticatedUser> {
    const payload = await this.jwtService.verifyAsync<UserJwtPayload>(token, { audience: JwtAudience.PLATFORM });

    const user = await new UserTypeOrmRepository(this.dataSource.manager).findById(payload.sub);
    if (!user?.canSignIn) {
      throw new UnauthorizedException('User is inactive or no longer exists');
    }

    return { id: user.id, name: user.name, email: user.email };
  }
}
