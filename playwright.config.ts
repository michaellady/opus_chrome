import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false, // Run sequentially to avoid conflicts
  retries: 2,
  workers: 1,
  
  use: {
    headless: false, // Set to true for CI/CD
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    // Add longer timeout for navigation
    navigationTimeout: 30000,
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./src/config/global-setup.ts'),
  globalTeardown: require.resolve('./src/config/global-teardown.ts'),
}); 