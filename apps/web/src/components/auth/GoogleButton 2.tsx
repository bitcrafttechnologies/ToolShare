'use client';

import { useState } from 'react';
import { Components } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const { Button, Alert } = Components;

interface Props {
  /** Where to land after the exchange. Mirrors LoginForm's `next`. */
  next?: string | undefined;
  /** Wording differs between "sign in" and "sign up" even though the flow is identical. */
  label?: string;
}

/**
 * One-tap Google sign-in (TKT-00002).
 *
 * Hands Supabase our existing PKCE callback, which already exchanges any
 * `?code=` for a session and honours `?next=` — no route changes were needed
 * to support OAuth.
 *
 * The account still has to clear the signup gate. `signInWithOAuth` has no
 * `data:` option to carry an invite code (unlike `signUp`), so a Google
 * account gets in only if its address is in `approved_emails` — see migration
 * 0019. A rejected signup comes back to /login?error=not_approved.
 */
export function GoogleButton({ next = '/', label = 'Continue with Google' }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (authError) throw authError;
      // On success the browser is navigating to Google; leave the button
      // disabled rather than flashing back to its resting state.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start Google sign-in');
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleClick}
        isLoading={loading}
        className="w-full"
      >
        <GoogleMark />
        {label}
      </Button>
      {error ? <Alert variant="danger">{error}</Alert> : null}
    </div>
  );
}

/** Google's four-colour mark. Inline so the strict CSP doesn't need a remote asset. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

/** Visual separator between the OAuth button and the email form. */
export function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
