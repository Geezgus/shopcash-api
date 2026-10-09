import pg from 'pg';

/**
 * Recreates the e2e database before the run so every run starts from an empty schema.
 * Uses the DATABASE_* connection settings from the environment / .env file.
 */
export default async function setup() {
  try {
    process.loadEnvFile();
  } catch {
    // No .env file.
  }

  const database = process.env.E2E_DATABASE_NAME ?? 'shopcash_test';
  if (!/^[a-z0-9_]+$/.test(database)) {
    throw new Error(`Invalid e2e database name: ${database}`);
  }

  const client = new pg.Client({
    host: process.env.DATABASE_HOSTNAME ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: 'postgres',
  });

  await client.connect();
  try {
    await client.query(`DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`);
    await client.query(`CREATE DATABASE "${database}"`);
  } finally {
    await client.end();
  }
}
