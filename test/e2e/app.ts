import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import type { Request } from 'express';
import { ApiKeysModule } from '@platform/api-keys/api-keys.module.js';
import { ApiKeyGuard } from '@platform/api-keys/infra/http/guards/api-key.guard.js';
import { type MailMessage, Mailer } from '@shared/application/services/mailer.js';
import { AppModule } from '@/app.module.js';
import { configureApp } from '@/configure-app.js';

export class FakeMailer extends Mailer {
  readonly sent: MailMessage[] = [];

  async send(message: MailMessage): Promise<void> {
    this.sent.push(message);
  }
}

/** A route protected by API key, standing in for the machine-to-machine routes of a real API. */
@UseGuards(ApiKeyGuard)
@Controller('e2e/api-key-protected')
class ApiKeyProtectedController {
  @Get()
  get(@Req() request: Request) {
    return request.apiKey;
  }
}

export async function createTestApp() {
  const mailer = new FakeMailer();
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule, ApiKeysModule],
    controllers: [ApiKeyProtectedController],
  })
    .overrideProvider(Mailer)
    .useValue(mailer)
    .compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>({ logger: ['error', 'warn'] });
  configureApp(app);
  await app.init();

  return { app, mailer };
}
