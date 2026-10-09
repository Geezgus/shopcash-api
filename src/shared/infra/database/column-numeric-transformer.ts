import type { ValueTransformer } from 'typeorm';

/**
 * Postgres returns `numeric`/`decimal` columns as strings. Use this transformer to read them as numbers.
 */
export class ColumnNumericTransformer implements ValueTransformer {
  to(data: number | null): number | null {
    return data;
  }

  from(data: string | null): number | null {
    return data === null ? null : Number.parseFloat(data);
  }
}
