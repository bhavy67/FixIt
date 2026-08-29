import { test, expect } from '@playwright/test';

test('json formatter: pick → run → preview + download', async ({ page }) => {
  await page.goto('/');

  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles({
      name: 'data.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{"foo":1,"bar":[1,2]}', 'utf-8'),
    });

  await expect(page.getByText('data.json')).toBeVisible();

  await page.locator('button[data-tool-id="json-formatter"]').click();

  const runButton = page.getByRole('button', { name: /^run json formatter$/i });
  await expect(runButton).toBeVisible();
  await runButton.click();

  await expect(page.getByText('Done', { exact: true })).toBeVisible({ timeout: 10_000 });

  // Text preview shows the pretty-printed output.
  await expect(page.getByText(/"foo": 1/)).toBeVisible();

  // Download button is present with the .formatted.json filename.
  await expect(page.getByRole('button', { name: /download data\.formatted\.json/i })).toBeVisible();
});

test('json formatter: minify option produces compact output', async ({ page }) => {
  await page.goto('/');

  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles({
      name: 'data.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{\n  "foo": 1\n}', 'utf-8'),
    });

  await page.locator('button[data-tool-id="json-formatter"]').click();

  // Switch Mode select to Minify — first select in the options form.
  const modeSelect = page.locator('select').first();
  await modeSelect.selectOption('minify');

  await page.getByRole('button', { name: /^run json formatter$/i }).click();
  await expect(page.getByText('Done', { exact: true })).toBeVisible({ timeout: 10_000 });

  // Preview should contain the minified form, not the pretty one.
  await expect(page.getByText('{"foo":1}')).toBeVisible();
});
