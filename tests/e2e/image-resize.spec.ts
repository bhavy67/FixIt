import { test, expect } from '@playwright/test';

// Known-good 1x1 transparent PNG (RGBA).
const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

test('image resize: pick → configure → run → download visible', async ({ page }) => {
  await page.goto('/');

  await page.locator('input[type="file"]').first().setInputFiles({
    name: 'pixel.png',
    mimeType: 'image/png',
    buffer: PIXEL_PNG,
  });

  await expect(page.getByText('pixel.png')).toBeVisible();

  await page.locator('button[data-tool-id="image-resize"]').click();

  const runButton = page.getByRole('button', { name: /^run image resize$/i });
  await expect(runButton).toBeVisible();

  await runButton.click();

  await expect(page.getByText('Done', { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: /download/i }).first()).toBeVisible();
});
