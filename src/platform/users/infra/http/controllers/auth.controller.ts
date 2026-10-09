import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ZodResponse } from 'nestjs-zod';
import type { AuthenticatedUser } from '@platform/users/application/services/token-validator.js';
import { Public } from '@shared/infra/http/decorators/public.decorator.js';
import { STRICT_THROTTLE } from '@shared/infra/http/throttle.js';
import { AuthService } from '../../services/auth.service.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { ChangePasswordRequest } from '../dto/request/change-password.request.js';
import { ForgotPasswordRequest } from '../dto/request/forgot-password.request.js';
import { RefreshTokenRequest } from '../dto/request/refresh-token.request.js';
import { ResetPasswordRequest } from '../dto/request/reset-password.request.js';
import { SignInRequest } from '../dto/request/sign-in.request.js';
import { SignUpRequest } from '../dto/request/sign-up.request.js';
import { GetMeResponse } from '../dto/response/get-me.response.js';
import { SessionResponse } from '../dto/response/session.response.js';
import { SignUpResponse } from '../dto/response/sign-up.response.js';
import { AuthGuard } from '../guards/auth.guard.js';

@ApiTags('Auth')
@ApiBearerAuth('bearer')
@UseGuards(AuthGuard)
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Create an account' })
  @ZodResponse({ status: HttpStatus.CREATED, type: SignUpResponse })
  @Public()
  @Throttle(STRICT_THROTTLE)
  @Post('signup')
  signUp(@Body() body: SignUpRequest) {
    return this.authService.signUp(body);
  }

  @ApiOperation({ summary: 'Sign in with e-mail and password' })
  @ZodResponse({ status: HttpStatus.OK, type: SessionResponse })
  @Public()
  @Throttle(STRICT_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() body: SignInRequest) {
    return this.authService.signIn(body);
  }

  @ApiOperation({ summary: 'Exchange a refresh token for a new session (the refresh token is rotated)' })
  @ZodResponse({ status: HttpStatus.OK, type: SessionResponse })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() body: RefreshTokenRequest) {
    return this.authService.refreshSession(body);
  }

  @ApiOperation({ summary: 'Revoke a refresh token' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('signout')
  async signOut(@Body() body: RefreshTokenRequest): Promise<void> {
    await this.authService.signOut(body);
  }

  @ApiOperation({
    summary: 'Request a password reset',
    description: 'Always returns 202, whether or not the e-mail is registered. The token is delivered by e-mail.',
  })
  @ApiResponse({ status: HttpStatus.ACCEPTED })
  @Public()
  @Throttle(STRICT_THROTTLE)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordRequest): Promise<void> {
    await this.authService.forgotPassword(body);
  }

  @ApiOperation({ summary: 'Set a new password using a reset token. Signs the user out of every session.' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @Public()
  @Throttle(STRICT_THROTTLE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordRequest): Promise<void> {
    await this.authService.resetPassword(body);
  }

  @ApiOperation({ summary: "Change the authenticated user's password" })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @Throttle(STRICT_THROTTLE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('change-password')
  async changePassword(@Body() body: ChangePasswordRequest, @CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.authService.changePassword({
      userId: user.id,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });
  }

  @ApiOperation({ summary: 'Get the authenticated user' })
  @ZodResponse({ status: HttpStatus.OK, type: GetMeResponse })
  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe({ userId: user.id });
  }
}
