import { test, expect } from '@playwright/test';
const BASE = process.env.E2E_BASE_URL || 'http://host.docker.internal:8080';

test('PWA carrega e consome API', async ({ page }) => {
  await page.goto(BASE);
  await expect(page).toHaveTitle(/Extensão Pedro/);
  await page.click('#getQuote');
  await page.waitForSelector('#quoteText');
  const text = await page.textContent('#quoteText');
  expect(text.length).toBeGreaterThan(0);
});