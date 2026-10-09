import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const schema = z
  .object({
    email: z.email().max(320).describe('The e-mail address of the user').meta({ example: 'john.doe@example.com' }),
    password: z.string().min(1).max(128).describe("The user's password").meta({ example: 'P@ssw0rd!' }),
  })
  .strict();

export class SignInRequest extends createZodDto(schema) {}
