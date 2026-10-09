import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const schema = z
  .object({
    currentPassword: z.string().min(1).max(128).describe("The user's current password"),
    newPassword: z.string().min(1).max(128).describe("The user's new password"),
  })
  .strict();

export class ChangePasswordRequest extends createZodDto(schema) {}
