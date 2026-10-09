import { Injectable } from '@nestjs/common';
import type { PasswordResetRequestedEvent } from '@platform/users/domain/events/password-reset-requested.event.js';
import type { EventHandler } from '@shared/application/services/event-handler.js';
import { Mailer } from '@shared/application/services/mailer.js';

@Injectable()
export class PasswordResetRequestedHandler implements EventHandler<PasswordResetRequestedEvent> {
  constructor(private readonly mailer: Mailer) {}

  async handle(event: PasswordResetRequestedEvent): Promise<void> {
    // Usually this is a link to the front-end, e.g. `${APP_URL}/reset-password?token=${event.token}`.
    await this.mailer.send({
      to: event.userEmail,
      subject: 'Reset your password',
      text: [
        `Hi ${event.userName},`,
        `Use the token below to reset your password. It expires at ${event.expiresAt.toISOString()}.`,
        event.token,
        "If you didn't request a password reset, you can ignore this e-mail.",
      ].join('\n\n'),
    });
  }
}
