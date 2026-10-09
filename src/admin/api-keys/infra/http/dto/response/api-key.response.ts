import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';
import { stringToDateTime } from '@shared/infra/zod-codecs.js';

const schema = z
  .object({
    id: z.uuidv7().describe('The unique identifier of the API key'),
    name: z.string().describe('The name of the API key'),
    keyPrefix: z.string().describe('The first characters of the key, to recognize it'),
    isActive: z.boolean().describe('Whether the key is accepted'),
    lastUsedAt: stringToDateTime.nullable().describe('When the key was last used'),
    createdBy: z.uuidv7().describe('The admin who created the key'),
    createdAt: stringToDateTime.describe('When the API key was created'),
  })
  .meta({ title: 'ApiKeyResponse' });

export class ApiKeyResponse extends createZodDto(schema, { codec: true }) {}
