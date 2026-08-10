import { test, expect } from '@playwright/test';

// TKT-00005: "Navigation Bar in mobile only shows the account and message
// links in vertical positions." At phone widths the header hid all three of
// its nav links (`hidden md:flex`) and Favorites/Bug report/Bookings
// (`hidden sm:flex`), leaving a signed-in user with exactly two things:
// Messages and their avatar. There was no hamburger, drawer or sheet anywhere
// in the app, so Bookings, Lend a Tool and the bug report were unreachable.
//
// Viewport is set per-test rather than by adding a Playwright project, so the
// rest of the suite keeps running once at desktop size.
//
// Demo seed account (see supabase/seed.sql). Override via env for other envs.
const OWNER_EMAIL = process.env.E2E_NAV_OWNER_EMAIL ?? 'tom.nguyen@toolshare-demo.app';
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD ?? 'Dm0-T00lshare-Seed-2026';

const PHONE = { width: 390, height: 844 };

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(OWNER_EMAIL);
  await page.getByLabel('Password').fill(OWNER_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/', { timeout: 15_000 });
}

test.describe('phone width', () => {
  test.use({ viewport: PHONE });

  test('a signed-in phone user can reach every destination the ticket asked for', async ({
    page,
  }) => {
    await signIn(page);

    const tabs = page.getByRole('navigation', { name: 'Main' });
    await expect(tabs).toBeVisible();

    // The four the ticket named, plus Browse. Scoped to the tab bar so the
    // footer's links can't satisfy these assertions by accident.
    await expect(tabs.getByRole('link', { name: /bookings/i })).toBeVisible();
    await expect(tabs.getByRole('link', { name: /lend/i })).toBeVisible();
    await expect(tabs.getByRole('link', { name: /messages/i })).toBeVisible();
    await expect(tabs.getByRole('link', { name: /browse/i })).toBeVisible();

    // Bug report has no tab; it stays in the header and must be visible here.
    await expect(page.getByRole('link', { name: 'Report a bug' })).toBeVisible();
  });

  test('tapping a tab actually navigates', async ({ page }) => {
    await signIn(page);

    const tabs = page.getByRole('navigation', { name: 'Main' });
    await tabs.getByRole('link', { name: /lend/i }).click();
    await expect(page).toHaveURL(/\/add-tool$/);

    await tabs.getByRole('link', { name: /bookings/i }).click();
    await expect(page).toHaveURL(/\/bookings$/);
  });

  test('a signed-out visitor gets a way in instead of owner tabs', async ({ page }) => {
    await page.goto('/');

    const tabs = page.getByRole('navigation', { name: 'Main' });
    await expect(tabs.getByRole('link', { name: /sign in/i })).toBeVisible();
    await expect(tabs.getByRole('link', { name: /bookings/i })).toBeHidden();
  });

  test('the tab bar does not cover the footer', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded();

    const footer = await page.getByRole('contentinfo').boundingBox();
    const tabs = await page.getByRole('navigation', { name: 'Main' }).boundingBox();

    // Body padding has to keep the fixed bar clear of the last footer row.
    expect(footer!.y + footer!.height).toBeLessThanOrEqual(tabs!.y + 1);
  });
});

test.describe('desktop width', () => {
  test('the tab bar gives way to the header, so nothing is offered twice', async ({ page }) => {
    await signIn(page);

    await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();

    // Scoped to the header: the footer carries its own "Lend a tool" link, and
    // accessible-name matching is case-insensitive, so an unscoped query
    // matches both.
    const header = page.getByRole('banner');
    await expect(header.getByRole('link', { name: 'Lend a Tool' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Bookings' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Messages' })).toBeVisible();
  });
});
