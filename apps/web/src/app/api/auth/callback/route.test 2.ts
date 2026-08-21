// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/auth/callback/route';

const exchangeCodeForSession = vi.hoisted(() => vi.fn());
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => ({ auth: { exchangeCodeForSession } }),
}));

const call = async (url: string) => {
  const res = await GET(new Request(url));
  return res.headers.get('location');
};

beforeEach(() => {
  exchangeCodeForSession.mockReset();
  exchangeCodeForSession.mockResolvedValue({ error: null });
});

describe('auth callback', () => {
  // TKT-00002: this route was already provider-agnostic, which is why enabling
  // Google needed no new endpoint. Guarding that so it stays true.
  it('exchanges a code and honours where the user was heading', async () => {
    expect(await call('http://localhost:3000/api/auth/callback?code=abc&next=/bookings')).toBe(
      '/bookings',
    );
    expect(exchangeCodeForSession).toHaveBeenCalledWith('abc');
  });

  it('falls back to the home page when no next is given', async () => {
    expect(await call('http://localhost:3000/api/auth/callback?code=abc')).toBe('/');
  });

  // The production bug: Cloud Run proxies to the container, so the origin Next
  // derives from the request is the container's bind address rather than
  // toolshare.bitcrafttech.com. Building the redirect from it sent every
  // signed-in Google user to http://0.0.0.0:8080/.
  it('ignores the origin the server sees behind a proxy', async () => {
    expect(await call('http://0.0.0.0:8080/api/auth/callback?code=abc&next=/bookings')).toBe(
      '/bookings',
    );
    expect(await call('http://0.0.0.0:8080/api/auth/callback?error=access_denied')).toBe(
      '/login?error=cancelled',
    );
  });

  // A relative Location makes `next` an open-redirect vector in a way the old
  // absolute form was not — a browser reads `//host` and `/\host` as
  // protocol-relative and leaves the site.
  it('refuses a next that would leave the site', async () => {
    expect(await call('http://localhost:3000/api/auth/callback?code=abc&next=//evil.com')).toBe('/');
    expect(
      await call('http://localhost:3000/api/auth/callback?code=abc&next=/%5Cevil.com'),
    ).toBe('/');
    expect(
      await call('http://localhost:3000/api/auth/callback?code=abc&next=https://evil.com'),
    ).toBe('/');
  });

  // TKT-00002: a Google account that isn't on the pilot is rejected by
  // enforce_invite_code, which GoTrue reports as a generic database error.
  // Sending that to the generic "authentication failed" message reads as "the
  // site is broken" rather than "you're not on the pilot yet".
  it('tells a non-approved account it is not on the pilot', async () => {
    exchangeCodeForSession.mockResolvedValue({
      error: new Error('Database error saving new user'),
    });

    expect(await call('http://localhost:3000/api/auth/callback?code=abc')).toBe(
      '/login?error=not_approved',
    );
  });

  it('also recognises the raw invite-code rejection', async () => {
    exchangeCodeForSession.mockResolvedValue({
      error: new Error('An invite code is required to sign up.'),
    });

    expect(await call('http://localhost:3000/api/auth/callback?code=abc')).toBe(
      '/login?error=not_approved',
    );
  });

  it('keeps the generic error for unrelated exchange failures', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: new Error('code verifier mismatch') });

    expect(await call('http://localhost:3000/api/auth/callback?code=abc')).toBe(
      '/login?error=auth',
    );
  });

  // TKT-00002: dismissing Google's consent screen never produces a code, so
  // without this it looked identical to a real failure.
  it('treats a dismissed consent screen as a cancellation', async () => {
    expect(await call('http://localhost:3000/api/auth/callback?error=access_denied')).toBe(
      '/login?error=cancelled',
    );
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('rejects a request carrying neither a code nor an error', async () => {
    expect(await call('http://localhost:3000/api/auth/callback')).toBe(
      '/login?error=auth',
    );
  });
});
