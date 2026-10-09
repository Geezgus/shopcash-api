import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const schema = z
  .object({
    email: z.email().max(320).describe('The e-mail address of the admin').meta({ example: 'admin@example.com' }),
    password: z.string().min(1).max(128).describe('The password of the admin'),
  })
  .strict();

export class AdminSignInRequest extends createZodDto(schema) {}
