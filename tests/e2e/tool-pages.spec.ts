import { test, expect } from '@playwright/test';

test('/tools index lists all registered tools grouped by category', async ({ page }) => {
  await page.goto('/tools');

  await expect(page.getByRole('heading', { level: 1, name: 'All tools' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Image Resize/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /JSON Formatter/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Merge PDF/i })).toBeVisible();
});

test('/tools/[slug] renders tool metadata + how-it-works', async ({ page }) => {
  await page.goto('/tools/resize-image');

  await expect(page.getByRole('heading', { level: 1, name: 'Image Resize' })).toBeVisible();
  await expect(page.getByText(/Change dimensions/i)).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /How it works/i })).toBeVisible();

  // Workspace is embedded and ready to accept files
  await expect(page.getByRole('button', { name: /choose files/i })).toBeVisible();
});

test('preset workspace auto-selects the tool when matching files are dropped', async ({ page }) => {
  await page.goto('/tools/resize-image');

  const PIXEL_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64',
  );

  await page.locator('input[type="file"]').first().setInputFiles({
    name: 'pixel.png',
    mimeType: 'image/png',
    buffer: PIXEL_PNG,
  });

  // Skips the picker entirely — Configure panel appears directly.
  await expect(page.getByRole('button', { name: /^run image resize$/i })).toBeVisible();
  // Tool picker heading should NOT be shown, because preset auto-selected.
  await expect(page.getByText(/what would you like to do/i)).toHaveCount(0);
});

test('unknown slug returns 404', async ({ page }) => {
  const res = await page.goto('/tools/does-not-exist');
  expect(res?.status()).toBe(404);
});
