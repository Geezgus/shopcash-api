import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ZodResponse } from 'nestjs-zod';
import type { AuthenticatedAdmin } from '@admin/auth/application/services/admin-token-validator.js';
import { Public } from '@shared/infra/http/decorators/public.decorator.js';
import { STRICT_THROTTLE } from '@shared/infra/http/throttle.js';
import { CurrentAdmin } from '../decorators/current-admin.decorator.js';
import { AdminSignInRequest } from '../dto/request/admin-sign-in.request.js';
import { AdminSignInResponse } from '../dto/response/admin-sign-in.response.js';
import { AdminAuthService } from '../../services/admin-auth.service.js';
import { AdminAuthGuard } from '../guards/admin-auth.guard.js';

@ApiTags('Auth')
@ApiBearerAuth('admin-jwt')
@UseGuards(AdminAuthGuard)
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @ApiOperation({ summary: 'Sign in as an admin' })
  @ZodResponse({ status: HttpStatus.OK, type: AdminSignInResponse })
  @Public()
  @Throttle(STRICT_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() body: AdminSignInRequest) {
    return this.adminAuthService.signIn(body);
  }

  @ApiOperation({ summary: 'Get the authenticated admin' })
  @Get('me')
  getMe(@CurrentAdmin() admin: AuthenticatedAdmin): AuthenticatedAdmin {
    return admin;
  }
}
