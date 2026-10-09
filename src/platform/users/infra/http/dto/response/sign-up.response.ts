import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const schema = z
  .object({
    id: z.uuidv7().describe('The unique identifier of the user'),
    name: z.string().describe('The name of the user'),
    email: z.email().describe('The e-mail address of the user'),
  })
  .meta({ title: 'SignUpResponse' });

export class SignUpResponse extends createZodDto(schema, { codec: true }) {}
