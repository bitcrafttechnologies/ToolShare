import { test, expect } from '@playwright/test';

// TKT-00003: a newly created listing was reachable from /my-listings and its
// own detail page, but never appeared in search. Those owner-side views are
// plain table queries; search goes through the geo-filtered
// `search_tools_nearby` RPC, which dropped every row whose location_point was
// NULL — and nothing ever set it. Only an end-to-end run exercises that RPC,
// so this is the test that actually covers the reported bug.
//
// Demo seed account (see supabase/seed.sql). Override via env for other envs.
const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL ?? 'mike.harrison@toolshare-demo.app';
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD ?? 'Dm0-T00lshare-Seed-2026';

async function signIn(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/', { timeout: 15_000 });
}

test('a tool listed through the form is findable in search', async ({ page }) => {
  // Unique per run: this creates a real row, and the assertion has to be able
  // to tell this run's listing from any left by an earlier one.
  const title = `E2E Rotary Hammer ${Date.now()}`;

  await signIn(page, OWNER_EMAIL, OWNER_PASSWORD);

  await page.goto('/add-tool');
  await page.getByRole('textbox', { name: /title/i }).fill(title);
  await page.getByRole('combobox', { name: /city/i }).selectOption('tempe');
  await page.getByRole('spinbutton', { name: /daily rate/i }).fill('40');
  await page.getByRole('button', { name: /list my tool/i }).click();

  // The form redirects to the new listing once it saves.
  await page.waitForURL(/\/tools\/[0-9a-f-]{36}$/, { timeout: 20_000 });
  await expect(page.getByRole('heading', { name: title })).toBeVisible();

  // The actual regression: the same listing, through the search RPC.
  await page.goto(`/search?q=${encodeURIComponent(title)}`);
  await expect(page.getByRole('link', { name: new RegExp(title) }).first()).toBeVisible();

  // And it must be a real result, not the "nothing matched" state.
  await expect(page.getByText('No tools matched')).toBeHidden();
});

test('the city is required, so a listing cannot be saved with no location', async ({ page }) => {
  await signIn(page, OWNER_EMAIL, OWNER_PASSWORD);

  await page.goto('/add-tool');
  await page.getByRole('textbox', { name: /title/i }).fill(`E2E No City ${Date.now()}`);
  await page.getByRole('button', { name: /list my tool/i }).click();

  // Still on the form — a listing with no service area is exactly the state
  // the reported listings were saved in.
  await expect(page).toHaveURL(/\/add-tool$/);
});
