import { Logger } from '@nestjs/common';
import { type MailMessage, Mailer } from '@shared/application/services/mailer.js';

/**
 * Development mailer: writes e-mails to the log instead of sending them.
 * Replace it with a real provider in MailModule before going to production.
 */
export class ConsoleMailer extends Mailer {
  private readonly logger = new Logger(ConsoleMailer.name);

  async send(message: MailMessage): Promise<void> {
    this.logger.log(`To: ${message.to} | Subject: ${message.subject}\n${message.text}`);
  }
}
