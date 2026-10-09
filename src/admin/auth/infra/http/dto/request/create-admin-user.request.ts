import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';
import { AdminRole } from '@admin/auth/domain/types/admin-role.js';

const schema = z
  .object({
    name: z.string().trim().min(1).max(200).describe('The name of the admin').meta({ example: 'Jane Doe' }),
    email: z.email().max(320).describe('The e-mail address of the admin').meta({ example: 'jane.doe@example.com' }),
    password: z.string().min(1).max(128).describe('The initial password of the admin'),
    role: z.enum(AdminRole).describe('The role of the admin'),
  })
  .strict();

export class CreateAdminUserRequest extends createZodDto(schema) {}
