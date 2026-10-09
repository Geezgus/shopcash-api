import { Global, Logger, Module, type OnApplicationBootstrap } from '@nestjs/common';
import { Mailer } from '@shared/application/services/mailer.js';
import { env } from '@/env.js';
import { ConsoleMailer } from './console-mailer.js';

@Global()
@Module({
  providers: [{ provide: Mailer, useClass: ConsoleMailer }],
  exports: [Mailer],
})
export class MailModule implements OnApplicationBootstrap {
  constructor(private readonly mailer: Mailer) {}

  onApplicationBootstrap() {
    if (env.NODE_ENV === 'production' && this.mailer instanceof ConsoleMailer) {
      new Logger(MailModule.name).warn('ConsoleMailer is active in production: e-mails are logged, not sent.');
    }
  }
}
