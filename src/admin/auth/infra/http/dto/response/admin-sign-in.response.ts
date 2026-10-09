import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';
import { AdminRole } from '@admin/auth/domain/types/admin-role.js';

const schema = z
  .object({
    accessToken: z.string().describe('JWT access token. Send it as `Authorization: Bearer <token>`'),
    accessTokenExpiresIn: z.number().int().describe('Seconds until the access token expires'),
    admin: z.object({
      id: z.uuidv7(),
      name: z.string(),
      email: z.email(),
      role: z.enum(AdminRole),
    }),
  })
  .meta({ title: 'AdminSignInResponse' });

export class AdminSignInResponse extends createZodDto(schema, { codec: true }) {}
