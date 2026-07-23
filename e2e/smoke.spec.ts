import { test, expect } from '@playwright/test';

test('home page renders the hero and category grid', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /what do you need for your next project/i }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Browse by category' })).toBeVisible();
});

test('search page renders results', async ({ page }) => {
  await page.goto('/search');
  await expect(page.getByRole('heading', { name: /browse tools|results for/i })).toBeVisible();
  // The category filter rail is always present on search.
  await expect(page.getByRole('navigation', { name: /filter by category/i })).toBeVisible();
});

test('how-it-works page is reachable', async ({ page }) => {
  await page.goto('/how-it-works');
  await expect(page.getByRole('heading', { name: /how toolshare works/i })).toBeVisible();
});
