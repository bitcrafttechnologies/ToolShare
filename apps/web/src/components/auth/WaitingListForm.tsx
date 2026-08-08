'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Components } from '@toolshare/ui';

const { Button, Checkbox, FormField, Input, Alert } = Components;

export function WaitingListForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [joinBeta, setJoinBeta] = useState(false);
  const [joinEmailList, setJoinEmailList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Formspree relays to the inbox configured on the form itself, so only the
    // public form ID ends up in the client bundle — no address to leak.
    const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;
    if (!endpoint) {
      setError('The waiting list isn’t accepting signups right now. Please try again later.');
      return;
    }

    setLoading(true);
    try {
      const form = e.currentTarget;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email,
          beta_program: joinBeta ? 'Yes' : 'No',
          email_list: joinEmailList ? 'Yes' : 'No',
          _subject: 'Toolshare waiting list signup',
          // Formspree's honeypot: bots fill every field, humans never see it.
          _gotcha: (form.elements.namedItem('_gotcha') as HTMLInputElement | null)?.value ?? '',
        }),
      });

      if (!response.ok) {
        // Formspree reports validation problems as { errors: [{ message }] }.
        const body = (await response.json().catch(() => null)) as {
          errors?: { message?: string }[];
        } | null;
        throw new Error(body?.errors?.[0]?.message ?? 'Could not add you to the waiting list');
      }

      router.push('/?waitlist=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add you to the waiting list');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField
        label="Email"
        required
        helperText="We’ll only use this to contact you about Toolshare."
      >
        <Input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </FormField>

      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {/* role="group" rather than <fieldset>/<legend>: a legend isn't laid out
          as a flex item and carries its own default inline padding, so it
          drifted out of line with the labels above it. */}
      <div role="group" aria-labelledby="optin-heading" className="flex flex-col gap-3">
        <p id="optin-heading" className="text-sm font-medium text-foreground">
          What would you like to be part of?
        </p>

        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            className="mt-0.5"
            checked={joinBeta}
            onChange={(e) => setJoinBeta(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-medium">Add me to the Beta program</span>
            <span className="block text-sm text-muted-foreground">
              Get an invite code and start renting and lending before the full release.
            </span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            className="mt-0.5"
            checked={joinEmailList}
            onChange={(e) => setJoinEmailList(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-medium">Add me to the email list</span>
            <span className="block text-sm text-muted-foreground">
              Occasional updates on how Toolshare is coming along. No spam.
            </span>
          </span>
        </label>
      </div>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Button type="submit" size="lg" isLoading={loading} className="w-full">
        {loading ? 'Adding you…' : 'Join the waiting list'}
      </Button>
    </form>
  );
}
