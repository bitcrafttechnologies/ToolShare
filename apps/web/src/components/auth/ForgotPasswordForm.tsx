'use client';

import { useState } from 'react';
import { MailCheck } from 'lucide-react';
import { Components } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const { Button, FormField, Input, Alert } = Components;

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/profile`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the reset email');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-success-100">
          <MailCheck className="size-6 text-success-600" aria-hidden="true" />
        </div>
        <p className="font-heading font-semibold">Check your inbox</p>
        {/* Deliberately not confirming whether the address has an account —
            that would let anyone enumerate registered emails. */}
        <p className="text-sm text-muted-foreground">
          If an account exists for {email}, a reset link is on its way.
        </p>
      </div>
    );
  }

  return (
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

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Button type="submit" size="lg" isLoading={loading} className="w-full">
        {loading ? 'Sending…' : 'Send reset link'}
      </Button>
    </form>
  );
}
