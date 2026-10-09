import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';
import { stringToDateTime } from '@shared/infra/zod-codecs.js';

const schema = z
  .object({
    id: z.uuidv7().describe('The unique identifier of the user'),
    name: z.string().describe('The name of the user'),
    email: z.email().describe('The e-mail address of the user'),
    avatarUrl: z.url().nullable().describe("The URL of the user's avatar image, if any"),
    isVerified: z.boolean().describe('Whether the user has verified their e-mail address'),
    createdAt: stringToDateTime.describe('When the user was created'),
    updatedAt: stringToDateTime.describe('When the user was last updated'),
  })
  .meta({ title: 'GetMeResponse' });

export class GetMeResponse extends createZodDto(schema, { codec: true }) {}
