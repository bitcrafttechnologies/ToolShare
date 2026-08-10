import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests for the web app, run from the repo root. They exercise the
 * real Next.js app against the live Supabase backend (public pages + demo
 * accounts), so they double as a deploy smoke test.
 *
 * `webServer` boots the web dev server automatically; set PLAYWRIGHT_BASE_URL
 * to point at a deployed URL (e.g. the Vercel preview) and it skips that.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        // `next dev` renders every request fresh — it applies neither
        // prerendering nor `export const revalidate`. Specs that assert on
        // caching behaviour (e2e/tkt-00004-photo-edit.spec.ts) therefore pass
        // against dev whether or not the bug is present, so run those with
        // PLAYWRIGHT_PROD=1 (`pnpm test:e2e:prod`), which builds first.
        command: process.env.PLAYWRIGHT_PROD
          ? 'pnpm --filter @toolshare/web build && pnpm --filter @toolshare/web start'
          : 'pnpm --filter @toolshare/web dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
