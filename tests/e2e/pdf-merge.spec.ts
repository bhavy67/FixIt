import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

async function makeTinyPdf(): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.addPage([120, 120]);
  const bytes = await doc.save();
  return Buffer.from(bytes);
}

test('pdf merge: two PDFs → merged output ready to download', async ({ page }) => {
  const [a, b] = await Promise.all([makeTinyPdf(), makeTinyPdf()]);

  await page.goto('/');

  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles([
      { name: 'first.pdf', mimeType: 'application/pdf', buffer: a },
      { name: 'second.pdf', mimeType: 'application/pdf', buffer: b },
    ]);

  await expect(page.getByText('first.pdf')).toBeVisible();
  await expect(page.getByText('second.pdf')).toBeVisible();
  await expect(page.getByText(/2 files ready/i)).toBeVisible();

  await page.locator('button[data-tool-id="pdf-merge"]').click();

  const runButton = page.getByRole('button', { name: /^run merge pdf$/i });
  await expect(runButton).toBeVisible();
  await runButton.click();

  // Done panel appears; merging in a worker plus lazy pdf-lib load can take a beat.
  await expect(page.getByText('Done', { exact: true })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('button', { name: /download merged-2-files\.pdf/i })).toBeVisible();
});
