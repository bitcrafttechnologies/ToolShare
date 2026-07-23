import { test, expect } from '@playwright/test';

// The pilot is invite-only. This checks the gate without creating a user: the
// form's pre-check (check_invite_code RPC) rejects an invalid code up front.
test('signup requires a valid invite code', async ({ page }) => {
  await page.goto('/register');

  await expect(page.getByText('Toolshare is invite-only during the pilot.')).toBeVisible();

  await page.getByLabel('Invite code').fill('NOPE-NOT-REAL');
  await page.getByLabel('Display name').fill('E2E Tester');
  await page.getByLabel('Email').fill(`e2e-${Date.now()}@example.com`);
  await page.getByLabel('Password').fill('Test-1234!');
  await page.getByRole('button', { name: /create account/i }).click();

  await expect(page.getByText(/invite code isn.t valid/i)).toBeVisible();
});

// A shared invite link (?invite=CODE) prefills the field.
test('invite link prefills the code', async ({ page }) => {
  await page.goto('/register?invite=PHX-PILOT-2026');
  await expect(page.getByLabel('Invite code')).toHaveValue('PHX-PILOT-2026');
});
