import { test, expect } from '@playwright/test';

// TKT-00004: "I uploaded a photo of myself, then a photo of the chainsaw, then
// I went to edit it, removed my photo and added another photo of the chainsaw
// but it kept the old photos."
//
// The database write was always correct — the form sends the full replacement
// array. What was stale was the rendered page: /tools/[id] is prerendered with
// `revalidate = 3600`, and nothing ever called revalidatePath, so the owner was
// redirected back onto up-to-an-hour-old HTML showing the photos they had just
// removed. `router.refresh()` could not fix it; that clears the client Router
// Cache, while the stale HTML lives in the server's Full Route Cache.
//
// This is the only test that can catch the regression: a jsdom unit test never
// renders the cached server route at all.
//
// MUST be run against a production build — `pnpm test:e2e:prod`. `next dev`
// applies neither prerendering nor `revalidate`, so against the default dev
// server this spec passes whether or not the fix is present. Verified both
// ways: with revalidateTool removed it fails against `next start` and passes
// against `next dev`.
//
// Demo seed account (see supabase/seed.sql). Override via env for other envs.
//
// Deliberately NOT mike.harrison: the suite runs fullyParallel, and
// tkt-00003-search-visibility.spec.ts creates listings as Mike. Both specs
// would then be mutating one owner's listing set at the same time, which made
// this test flake when the full suite ran. A separate owner keeps them
// independent.
const OWNER_EMAIL = process.env.E2E_PHOTO_OWNER_EMAIL ?? 'elena.rodriguez@toolshare-demo.app';
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD ?? 'Dm0-T00lshare-Seed-2026';

async function signIn(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/', { timeout: 15_000 });
}

test('removing a photo updates the listing page, not just the database', async ({ page }) => {
  await signIn(page, OWNER_EMAIL, OWNER_PASSWORD);

  // Reach a listing through the UI rather than a hardcoded id, which doesn't
  // survive `supabase db reset`. It has to be one that actually has a photo:
  // rows render a thumbnail only when photo_urls is non-empty, and the list is
  // newest-first, so the top row is often a photoless listing left by another
  // spec.
  await page.goto('/my-listings');
  const rowWithPhoto = page
    .getByRole('listitem')
    .filter({ has: page.locator('img') })
    .first();
  await expect(rowWithPhoto).toBeVisible();

  const editHref = await rowWithPhoto.getByRole('link', { name: 'Edit' }).getAttribute('href');
  const toolId = editHref!.replace('/tools/', '').replace('/edit', '');

  // Render the detail page FIRST, so there is a cached entry to go stale.
  // Without this step the route would simply be generated fresh afterwards and
  // the test would pass even with the bug present.
  await page.goto(`/tools/${toolId}`);
  const gallery = page.getByRole('img', { name: /photo 1 of/i });
  await expect(gallery).toBeVisible();

  // Remove the photo and save.
  await page.goto(`/tools/${toolId}/edit`);
  await page.getByRole('button', { name: 'Remove current photo 1' }).click();
  await page.getByRole('button', { name: /save changes/i }).click();

  // Back on the listing: the removed photo must be gone from the rendered page.
  await page.waitForURL(new RegExp(`/tools/${toolId}$`), { timeout: 20_000 });
  await expect(page.getByText('No photos provided for this tool')).toBeVisible();
  await expect(page.getByRole('img', { name: /photo 1 of/i })).toBeHidden();

  // And it must still be gone on a cold load in a fresh context — a same-tab
  // check could be satisfied by the client router cache alone.
  await page.reload();
  await expect(page.getByText('No photos provided for this tool')).toBeVisible();
});
