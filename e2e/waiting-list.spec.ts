import { test, expect } from '@playwright/test';

// The waiting list is the only way in for someone without a pilot code, so the
// two entry points into it are worth guarding. The submit path itself is
// covered by unit tests (apps/web/src/components/auth/WaitingListForm.test.tsx)
// rather than here — a real submit would post to Formspree and send an email.

test('the invite-code field offers the waiting list to people without a code', async ({ page }) => {
  await page.goto('/register');

  await page.getByRole('link', { name: /join the waiting list/i }).click();

  await expect(page).toHaveURL(/\/waiting-list$/);
  await expect(page.getByRole('heading', { name: 'Join the waiting list' })).toBeVisible();
});

test('the sign-in page offers the waiting list', async ({ page }) => {
  await page.goto('/login');

  await page.getByRole('link', { name: /waiting list/i }).click();

  await expect(page).toHaveURL(/\/waiting-list$/);
});

test('the waiting list explains the Beta and offers both opt-ins', async ({ page }) => {
  await page.goto('/waiting-list');

  await expect(page.getByText(/in Beta and invite-only/i)).toBeVisible();
  await expect(page.getByText(/waiting list for the full app release/i)).toBeVisible();

  await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();

  const beta = page.getByRole('checkbox', { name: /Add me to the Beta program/i });
  const emailList = page.getByRole('checkbox', { name: /Add me to the email list/i });

  // Neither is pre-ticked — opting in has to be a deliberate choice.
  await expect(beta).not.toBeChecked();
  await expect(emailList).not.toBeChecked();

  await beta.check();
  await emailList.check();
  await expect(beta).toBeChecked();
  await expect(emailList).toBeChecked();
});
