import { Injectable } from '@nestjs/common';
import type { PasswordChangedEvent } from '@platform/users/domain/events/password-changed.event.js';
import type { EventHandler } from '@shared/application/services/event-handler.js';
import { Mailer } from '@shared/application/services/mailer.js';

@Injectable()
export class PasswordChangedHandler implements EventHandler<PasswordChangedEvent> {
  constructor(private readonly mailer: Mailer) {}

  async handle(event: PasswordChangedEvent): Promise<void> {
    await this.mailer.send({
      to: event.userEmail,
      subject: 'Your password was changed',
      text: `Hi ${event.userName},\n\nYour password was changed. If it wasn't you, reset your password immediately.`,
    });
  }
}
