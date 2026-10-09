import path from 'node:path';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { env } from '@/env.js';
import { entities } from './entities.js';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: env.DATABASE_HOSTNAME,
  port: env.DATABASE_PORT,
  username: env.DATABASE_USERNAME,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  entities,
  // Only compiled migrations are loaded: run them from `dist` (see the migration:* scripts).
  migrations: [path.join(import.meta.dirname, 'migrations', '*.js')],
  migrationsRun: env.DATABASE_RUN_MIGRATIONS,
  synchronize: env.DATABASE_SYNCHRONIZE,
  logging: env.DATABASE_LOGGING,
  parseInt8: true, // return bigint columns as numbers
};

// Default export used by the TypeORM CLI.
export default new DataSource(dataSourceOptions);
