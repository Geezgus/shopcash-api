import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const schema = z
  .object({
    name: z.string().trim().min(1).max(200).describe('A name to identify the key').meta({ example: 'ERP integration' }),
  })
  .strict();

export class CreateApiKeyRequest extends createZodDto(schema) {}
