import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const schema = z
  .object({
    name: z.string().trim().min(1).max(200).describe('The full name of the user').meta({ example: 'John Doe' }),
    email: z.email().max(320).describe('The e-mail address of the user').meta({ example: 'john.doe@example.com' }),
    password: z.string().min(1).max(128).describe("The user's password").meta({ example: 'P@ssw0rd!' }),
  })
  .strict();

export class SignUpRequest extends createZodDto(schema) {}
