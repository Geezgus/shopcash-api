import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';
import { stringToDateTime } from '@shared/infra/zod-codecs.js';

const schema = z
  .object({
    id: z.uuidv7().describe('The unique identifier of the API key'),
    name: z.string().describe('The name of the API key'),
    key: z.string().describe('The API key. It is only shown once: store it safely.'),
    createdAt: stringToDateTime.describe('When the API key was created'),
  })
  .meta({ title: 'CreateApiKeyResponse' });

export class CreateApiKeyResponse extends createZodDto(schema, { codec: true }) {}
