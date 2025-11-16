import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'tests',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  use: { headless: true },
  projects: [ { name: 'chromium', use: { ...devices['Desktop Chrome'] } } ]
});