import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const schema = z
  .object({
    refreshToken: z.string().min(1).max(512).describe('The refresh token received on sign in'),
  })
  .strict();

export class RefreshTokenRequest extends createZodDto(schema) {}
