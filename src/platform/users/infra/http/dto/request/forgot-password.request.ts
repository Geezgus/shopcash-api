import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const schema = z
  .object({
    email: z.email().max(320).describe('The e-mail address of the account').meta({ example: 'john.doe@example.com' }),
  })
  .strict();

export class ForgotPasswordRequest extends createZodDto(schema) {}
