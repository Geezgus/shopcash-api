import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';
import { AdminRole } from '@admin/auth/domain/types/admin-role.js';
import { stringToDateTime } from '@shared/infra/zod-codecs.js';

export const adminUserSchema = z
  .object({
    id: z.uuidv7().describe('The unique identifier of the admin'),
    name: z.string().describe('The name of the admin'),
    email: z.email().describe('The e-mail address of the admin'),
    role: z.enum(AdminRole).describe('The role of the admin'),
    isActive: z.boolean().describe('Whether the admin can sign in'),
    createdAt: stringToDateTime.describe('When the admin was created'),
    updatedAt: stringToDateTime.describe('When the admin was last updated'),
  })
  .meta({ title: 'AdminUserResponse' });

export class AdminUserResponse extends createZodDto(adminUserSchema, { codec: true }) {}
