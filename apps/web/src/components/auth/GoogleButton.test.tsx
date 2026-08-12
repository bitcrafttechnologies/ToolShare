import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoogleButton } from '@/components/auth/GoogleButton';

interface OAuthArgs {
  provider: string;
  options: { redirectTo: string };
}

// Typed explicitly: inferring from a `{ error: null }` default would pin the
// return type too narrowly for the failure case below to compile.
const signInWithOAuth = vi.hoisted(() =>
  vi.fn<(args: OAuthArgs) => Promise<{ error: Error | null }>>(),
);
vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: () => ({ auth: { signInWithOAuth } }),
}));

beforeEach(() => {
  signInWithOAuth.mockReset();
  signInWithOAuth.mockResolvedValue({ error: null });
  window.history.replaceState(null, '', '/login');
});

const optionsOf = (): OAuthArgs => signInWithOAuth.mock.calls[0]![0];

describe('GoogleButton', () => {
  // TKT-00002: "Easy pass signup eg. Google". The whole point is that it hands
  // Supabase our existing PKCE callback — that route already exchanges any
  // ?code= for a session, so OAuth needed no new endpoint.
  it('starts Google sign-in through the existing PKCE callback', async () => {
    const user = userEvent.setup();
    render(<GoogleButton />);

    await user.click(screen.getByRole('button', { name: /continue with google/i }));

    await waitFor(() => expect(signInWithOAuth).toHaveBeenCalledTimes(1));
    expect(optionsOf().provider).toBe('google');
    expect(optionsOf().options.redirectTo).toBe(
      'http://localhost:3000/api/auth/callback?next=%2F',
    );
  });

  // TKT-00002: signing in from a protected page has to come back to that page,
  // the same way the email form's `next` does.
  it('preserves where the user was heading', async () => {
    const user = userEvent.setup();
    render(<GoogleButton next="/bookings" />);

    await user.click(screen.getByRole('button', { name: /continue with google/i }));

    await waitFor(() => expect(signInWithOAuth).toHaveBeenCalledTimes(1));
    expect(optionsOf().options.redirectTo).toBe(
      'http://localhost:3000/api/auth/callback?next=%2Fbookings',
    );
  });

  it('surfaces a failure to start the flow instead of failing silently', async () => {
    signInWithOAuth.mockResolvedValue({ error: new Error('provider disabled') });
    const user = userEvent.setup();
    render(<GoogleButton />);

    await user.click(screen.getByRole('button', { name: /continue with google/i }));

    expect(await screen.findByText('provider disabled')).toBeInTheDocument();
  });

  it('takes a caller-supplied label so sign-in and sign-up can read differently', () => {
    render(<GoogleButton label="Sign up with Google" />);
    expect(screen.getByRole('button', { name: 'Sign up with Google' })).toBeInTheDocument();
  });
});
