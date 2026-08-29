import { test, expect } from '@playwright/test';

test('home renders hero and popular tools', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Drop it.');
  await expect(page.getByRole('heading', { level: 2, name: 'Popular' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Compress PDF/i })).toBeVisible();
});

test('browse tools CTA navigates to /tools', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Browse tools/i }).click();
  await expect(page).toHaveURL(/\/tools$/);
  await expect(page.getByRole('heading', { level: 1, name: /Tools coming soon/i })).toBeVisible();
});
