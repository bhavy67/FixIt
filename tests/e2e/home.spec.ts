import { test, expect } from '@playwright/test';

test('home renders brand and tagline', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'FixIt' })).toBeVisible();
  await expect(page.getByText('Drop it. Fix it. Done.')).toBeVisible();
});
