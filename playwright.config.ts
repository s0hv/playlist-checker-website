import { defineConfig, devices } from '@playwright/test';

const port = 3100;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `pnpm exec vite dev --port ${port} --strictPort`,
    url: `http://localhost:${port}/auth/discord`,
    reuseExistingServer: false,
    timeout: 120_000,
    // The API is mocked in the tests, so these only need to let the server modules load
    env: {
      DATABASE_URL: 'postgres://e2e:e2e@127.0.0.1:1/e2e',
      DISCORD_ID: 'e2e',
      DISCORD_SECRET: 'e2e',
      OAUTH_REDIRECT: `http://localhost:${port}/auth/discord/callback`,
    },
  },
});
