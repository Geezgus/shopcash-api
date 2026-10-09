import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const schema = z
  .object({
    token: z.string().min(1).max(512).describe('The token sent to the user by e-mail'),
    newPassword: z.string().min(1).max(128).describe("The user's new password").meta({ example: 'NewP@ssw0rd!' }),
  })
  .strict();

export class ResetPasswordRequest extends createZodDto(schema) {}
