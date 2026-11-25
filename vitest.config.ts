import { defineConfig } from 'vitest/config';

// Kept separate from vite.config.ts so unit tests don't load the Netlify and TanStack Start plugins.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'types/**/*.test.ts'],
  },
});
