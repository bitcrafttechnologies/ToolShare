import { test, expect } from '@playwright/test';

// Demo seed accounts (see supabase/seed.sql). Override via env for other envs.
const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL ?? 'mike.harrison@toolshare-demo.app';
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD ?? 'Dm0-T00lshare-Seed-2026';
// A tool Mike owns.
const OWNED_TOOL_ID = process.env.E2E_OWNED_TOOL_ID ?? 'a8a2eef9-b00f-4576-a6d4-6460f093a7c0';

async function signIn(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL('**/', { timeout: 15_000 });
}

test('a lender cannot book their own tool', async ({ page }) => {
  await signIn(page, OWNER_EMAIL, OWNER_PASSWORD);

  // On their own listing, the booking panel is replaced with a manage prompt.
  await page.goto(`/tools/${OWNED_TOOL_ID}`);
  await expect(page.getByText('This is your listing')).toBeVisible();
  await expect(page.getByRole('link', { name: /edit listing/i })).toBeVisible();

  // And navigating straight to the booking flow is blocked too.
  await page.goto(`/booking/${OWNED_TOOL_ID}`);
  await expect(page.getByText(/you can.t rent a tool you own/i)).toBeVisible();
});
