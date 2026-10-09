import { Global, Module } from '@nestjs/common';
import { PasswordPolicyValidator } from '@shared/domain/services/password-policy-validator.js';
import { DefaultPasswordPolicyValidator } from './default-password-policy-validator.js';

@Global()
@Module({
  providers: [{ provide: PasswordPolicyValidator, useClass: DefaultPasswordPolicyValidator }],
  exports: [PasswordPolicyValidator],
})
export class PasswordPolicyModule {}
