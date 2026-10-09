import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const schema = z.object({
  id: z.uuidv7().describe('The unique identifier of the API key'),
});

export class ApiKeyIdParams extends createZodDto(schema) {}
