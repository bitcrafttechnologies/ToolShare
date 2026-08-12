import { test, expect } from '@playwright/test';

// TKT-00002: "Easy pass signup eg. Google."
//
// Scope note: the OAuth handshake itself is deliberately NOT automated. It
// leaves the app for Google's consent screen, which needs real credentials and
// a real account, and the provider is disabled in supabase/config.toml by
// default. What the button hands Supabase — provider, callback URL, preserved
// `next` — is asserted in apps/web/src/components/auth/GoogleButton.test.tsx,
// and the callback's own branching in
// apps/web/src/app/api/auth/callback/route.test.ts.
//
// What is worth covering here is the part a unit test can't see: that the
// entry points actually render on both pages, and that a rejected tester lands
// somewhere that explains why.

test('both entry points offer Google', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
  // The email form is still there — Google is an addition, not a replacement.
  await expect(page.getByLabel('Email')).toBeVisible();
  // And its own submit button stays distinguishable from the Google one.
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();

  await page.goto('/register');
  await expect(page.getByRole('button', { name: /sign up with google/i })).toBeVisible();
  await expect(page.getByLabel('Invite code')).toBeVisible();
});

test('a Google account that is not on the pilot is told why, and where to go', async ({ page }) => {
  // Where the callback sends a signup the invite gate rejected.
  await page.goto('/login?error=not_approved');

  await expect(page.getByText(/isn.t on the pilot yet/i)).toBeVisible();
  // Must offer the way forward rather than just refusing.
  await expect(page.getByRole('link', { name: /waiting list/i })).toBeVisible();

  // And it must not read as a site failure.
  await expect(page.getByText('Authentication failed. Please try again.')).toBeHidden();
});

test('dismissing the Google consent screen is not reported as a failure', async ({ page }) => {
  await page.goto('/login?error=cancelled');

  await expect(page.getByText(/sign-in was cancelled/i)).toBeVisible();
  await expect(page.getByText('Authentication failed. Please try again.')).toBeHidden();
});

test('a genuine auth failure still reports as one', async ({ page }) => {
  await page.goto('/login?error=auth');

  await expect(page.getByText('Authentication failed. Please try again.')).toBeVisible();
});
