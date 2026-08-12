'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Components } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { GoogleButton, AuthDivider } from '@/components/auth/GoogleButton';

const { Button, FormField, Input, Alert } = Components;

interface Props {
  next?: string | undefined;
}

export function LoginForm({ next = '/' }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* "Continue with", not "Sign in with": the label must not collide with
          the form's own "Sign in" submit button, for screen-reader users
          picking from a list of controls as much as for tests. */}
      <GoogleButton next={next} />
      <AuthDivider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Email" required>
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </FormField>

      <FormField label="Password" required>
        <Input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </FormField>

      <div className="-mt-1 text-right">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-primary hover:text-primary-600"
        >
          Forgot password?
        </Link>
      </div>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Button type="submit" size="lg" isLoading={loading} className="w-full">
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>
      </form>
    </div>
  );
}
