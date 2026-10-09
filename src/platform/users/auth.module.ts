import { Module, type OnModuleInit } from '@nestjs/common';
import { EventDispatcher } from '@shared/application/services/event-dispatcher.js';
import { TokenValidator } from './application/services/token-validator.js';
import { PasswordChangedEvent } from './domain/events/password-changed.event.js';
import { PasswordResetRequestedEvent } from './domain/events/password-reset-requested.event.js';
import { PasswordChangedHandler } from './infra/event-handlers/password-changed.handler.js';
import { PasswordResetRequestedHandler } from './infra/event-handlers/password-reset-requested.handler.js';
import { AuthController } from './infra/http/controllers/auth.controller.js';
import { AuthGuard } from './infra/http/guards/auth.guard.js';
import { AuthService } from './infra/services/auth.service.js';
import { TokenValidatorService } from './infra/services/token-validator.service.js';

/**
 * Platform users: sign up, sign in, sessions and passwords.
 * Import this module and use `@UseGuards(AuthGuard)` to protect routes of other platform modules.
 */
@Module({
  controllers: [AuthController],
  providers: [
    { provide: TokenValidator, useClass: TokenValidatorService },
    AuthService,
    AuthGuard,
    PasswordChangedHandler,
    PasswordResetRequestedHandler,
  ],
  exports: [TokenValidator, AuthGuard],
})
export class AuthModule implements OnModuleInit {
  constructor(
    private readonly eventDispatcher: EventDispatcher,
    private readonly passwordChangedHandler: PasswordChangedHandler,
    private readonly passwordResetRequestedHandler: PasswordResetRequestedHandler,
  ) {}

  onModuleInit() {
    this.eventDispatcher.register(PasswordChangedEvent, this.passwordChangedHandler);
    this.eventDispatcher.register(PasswordResetRequestedEvent, this.passwordResetRequestedHandler);
  }
}
