import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json (@shared, @platform, @admin, @).
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['test/unit/**/*.spec.ts'],
  },
});
