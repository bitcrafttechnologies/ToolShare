import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * PKCE callback. Provider-agnostic: it exchanges any `?code=` for a session,
 * which is why enabling Google sign-in (TKT-00002) needed no change here
 * beyond distinguishing *why* an exchange failed.
 *
 * Reached by the password-reset flow and by `signInWithOAuth`. Excluded from
 * the middleware matcher, so it runs without the auth guard.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'));

  // The provider itself can reject before we ever see a code — the user
  // dismissing Google's consent screen arrives here as ?error=access_denied.
  const providerError = searchParams.get('error');
  if (providerError) {
    const reason = providerError === 'access_denied' ? 'cancelled' : 'auth';
    return redirectTo(`/login?error=${reason}`);
  }

  if (code) {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirectTo(next);
    }

    // A signup blocked by public.enforce_invite_code() surfaces as a generic
    // GoTrue database error, which reads as "something broke" rather than
    // "you're not on the pilot yet". OAuth carries no invite code, so for a
    // Google user this is the expected rejection, and they need to be pointed
    // at the waiting list instead of left guessing.
    const blockedBySignupGate =
      /invite code|database error saving new user/i.test(error.message);
    return redirectTo(`/login?error=${blockedBySignupGate ? 'not_approved' : 'auth'}`);
  }

  return redirectTo('/login?error=auth');
}

/**
 * Redirect to a site-relative path, letting the browser resolve it against the
 * address bar.
 *
 * This used to build `${origin}${next}` from `new URL(request.url)`, which is
 * correct locally and wrong everywhere we actually deploy: Cloud Run
 * terminates TLS and proxies to the container, so the origin Next derives is
 * the container's own bind address (HOSTNAME=0.0.0.0, PORT=8080 — see the
 * Dockerfile). Every successful Google sign-in ended up at
 * http://0.0.0.0:8080/ with a valid session it could not use. A relative
 * Location has no origin to get wrong, in dev, Playwright, or production.
 *
 * `NextResponse.redirect` requires an absolute URL, hence the bare Response.
 */
function redirectTo(path: string) {
  return new Response(null, { status: 303, headers: { Location: path } });
}

/**
 * `?next=` is attacker-supplied and now goes into a relative Location, where
 * `//evil.com` is a protocol-relative URL that leaves the site — under the old
 * absolute form the same value stayed harmlessly on-origin. A leading `/` is
 * not enough of a check: browsers read `/\evil.com` as protocol-relative too.
 */
function safeNext(raw: string | null) {
  if (!raw?.startsWith('/') || raw[1] === '/' || raw[1] === '\\') return '/';
  return raw;
}
