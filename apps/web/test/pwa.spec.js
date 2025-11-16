import { test, expect } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:8081';

test('PWA carrega e mostra timer', async ({ page }) => {
  await page.goto(BASE);
  await expect(page).toHaveTitle(/Extensão Pedro PWA/);
  await page.waitForSelector('#timer');
  await page.waitForSelector('#apiStatus');
});
