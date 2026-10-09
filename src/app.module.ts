import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { AdminModule } from '@admin/admin.module.js';
import { PlatformModule } from '@platform/platform.module.js';
import { DatabaseModule } from '@shared/infra/database/database.module.js';
import { EventsModule } from '@shared/infra/events/events.module.js';
import { HealthModule } from '@shared/infra/health/health.module.js';
import { AllExceptionsFilter } from '@shared/infra/http/filters/all-exceptions.filter.js';
import { MailModule } from '@shared/infra/mail/mail.module.js';
import { PasswordPolicyModule } from '@shared/infra/services/password-policy.module.js';
import { env } from './env.js';

@Module({
  imports: [
    // Infrastructure
    DatabaseModule,
    EventsModule,
    MailModule,
    PasswordPolicyModule,
    JwtModule.register({ global: true, secret: env.TOKEN_SECRET }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: env.RATE_LIMIT_PER_MINUTE }],
      skipIf: () => env.NODE_ENV === 'test',
    }),
    HealthModule,

    // Features
    PlatformModule,
    AdminModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
