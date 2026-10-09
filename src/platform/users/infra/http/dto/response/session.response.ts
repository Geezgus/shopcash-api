import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';
import { stringToDateTime } from '@shared/infra/zod-codecs.js';

const schema = z
  .object({
    accessToken: z.string().describe('JWT access token. Send it as `Authorization: Bearer <token>`'),
    accessTokenExpiresIn: z.number().int().describe('Seconds until the access token expires'),
    refreshToken: z.string().describe('Single-use token to obtain a new session at /v1/auth/refresh'),
    refreshTokenExpiresAt: stringToDateTime.describe('When the refresh token expires'),
    user: z.object({
      id: z.uuidv7().describe('The unique identifier of the user'),
      name: z.string().describe('The name of the user'),
      email: z.email().describe('The e-mail address of the user'),
      avatarUrl: z.url().nullable().describe("The URL of the user's avatar image, if any"),
    }),
  })
  .meta({ title: 'SessionResponse' });

export class SessionResponse extends createZodDto(schema, { codec: true }) {}
