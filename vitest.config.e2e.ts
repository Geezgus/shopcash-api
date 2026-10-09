import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['test/e2e/**/*.e2e-spec.ts'],
    globalSetup: ['test/e2e/global-setup.ts'],
    // Spec files share the database: run them one at a time.
    fileParallelism: false,
    hookTimeout: 30_000,
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'warn',
      DATABASE_NAME: process.env.E2E_DATABASE_NAME ?? 'shopcash_test',
      // Vitest runs the TypeScript sources, where compiled migrations do not exist: build the schema from the entities.
      DATABASE_RUN_MIGRATIONS: 'false',
      DATABASE_SYNCHRONIZE: 'true',
      TOKEN_SECRET: 'e2e-secret-e2e-secret-e2e-secret-e2e-secret',
      SYSADMIN_NAME: 'Admin',
      SYSADMIN_EMAIL: 'admin@example.com',
      SYSADMIN_PASSWORD: 'Adm1n!Passw0rd',
    },
  },
});
