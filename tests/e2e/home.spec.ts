import { test, expect } from '@playwright/test';

test('home renders hero, drop zone, and popular tools', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Drop it.');
  await expect(page.getByText(/drop files here/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /choose files/i })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Popular' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Merge PDF/i })).toBeVisible();
});

test('primary nav Tools link navigates to /tools', async ({ page }) => {
  await page.goto('/');
  const width = page.viewportSize()?.width ?? 0;

  if (width < 768) {
    await page.getByRole('button', { name: /open menu/i }).click();
    // The Sheet dialog is the scope for mobile nav
    await page.getByRole('dialog').getByRole('link', { name: 'Tools' }).click();
  } else {
    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Tools' })
      .click();
  }

  await expect(page).toHaveURL(/\/tools$/);
  await expect(page.getByRole('heading', { level: 1, name: /All tools/i })).toBeVisible();
});
