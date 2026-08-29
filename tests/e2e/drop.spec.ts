import { test, expect } from '@playwright/test';

test('picking a file shows it in the file list, and it can be removed', async ({ page }) => {
  await page.goto('/');

  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: 'sample.pdf',
    mimeType: 'application/pdf',
    // "%PDF-1.7" magic bytes so the inspector classifies as PDF
    buffer: Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, 0x0a]),
  });

  await expect(page.getByText('sample.pdf')).toBeVisible();
  await expect(page.getByText(/1 file ready/i)).toBeVisible();
  // ToolPicker shows PDF tools for this file
  await expect(page.getByText(/split pdf|merge pdf|compress pdf/i).first()).toBeVisible();
  // PDF badge derived from magic bytes
  await expect(page.getByText('PDF', { exact: true }).first()).toBeVisible();

  await page.getByRole('button', { name: /remove sample\.pdf/i }).click();
  await expect(page.getByText('sample.pdf')).toHaveCount(0);
  await expect(page.getByText(/drop files here/i)).toBeVisible();
});
