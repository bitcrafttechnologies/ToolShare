'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Components } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const { Button, FormField, Input, Alert } = Components;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Prefill from a shared invite link, e.g. /register?invite=PHX-PILOT-2026.
  useEffect(() => {
    const fromUrl = searchParams.get('invite');
    if (fromUrl) setInviteCode(fromUrl);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const code = inviteCode.trim();

      // Friendly pre-check. The BEFORE-INSERT trigger is the real gate (and
      // consumes a use); this just gives a clear message instead of the
      // generic "database error" GoTrue returns when the trigger rejects.
      const { data: valid, error: checkError } = await supabase.rpc('check_invite_code', {
        p_code: code,
      });
      if (checkError) throw checkError;
      if (!valid) {
        setError('That invite code isn’t valid. Ask whoever invited you for a current one.');
        setLoading(false);
        return;
      }

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName, invite_code: code },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (authError) throw authError;
      router.push('/?registered=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField
        label="Invite code"
        required
        helperText="Toolshare is invite-only during the pilot. Enter the code you were given."
      >
        <Input
          type="text"
          autoComplete="off"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="e.g. PHX-PILOT-2026"
          required
        />
      </FormField>

      <FormField label="Display name" required>
        <Input
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </FormField>

      <FormField label="Email" required>
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </FormField>

      <FormField label="Password" required helperText="At least 8 characters.">
        <Input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </FormField>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Button type="submit" size="lg" isLoading={loading} className="w-full">
        {loading ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
