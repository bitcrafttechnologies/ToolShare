'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BugPlay } from 'lucide-react';
import { Components } from '@toolshare/ui';
import { useSessionUser } from '@/hooks/useSessionUser';

const { Button, FormField, Input, Textarea, Radio, Alert } = Components;

/**
 * Sent verbatim so the email says what the tester picked, colour and all,
 * instead of a bare "high" that needs a legend to read.
 */
const SEVERITIES = [
  { value: 'High', label: '🔴 High — I can’t use the app because of this' },
  { value: 'Medium', label: '🟡 Medium — Annoying, but I can work around it' },
  { value: 'Low', label: '🟢 Low — Minor / cosmetic, not really blocking anything' },
] as const;

const APP_VERSION = 'Beta';

export function BugReportForm() {
  const user = useSessionUser();

  const [email, setEmail] = useState('');
  const [whatHappened, setWhatHappened] = useState('');
  const [steps, setSteps] = useState('');
  const [expected, setExpected] = useState('');
  const [actual, setActual] = useState('');
  const [where, setWhere] = useState('');
  const [device, setDevice] = useState('');
  const [errors, setErrors] = useState('');
  const [severity, setSeverity] = useState<string>('');
  const [improvement, setImprovement] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Prefill the reply-to with the signed-in tester's address; the session
  // arrives a beat after first render, so this can't be initial state.
  useEffect(() => {
    if (user?.email) setEmail((current) => current || user.email!);
  }, [user]);

  function resetForm() {
    setWhatHappened('');
    setSteps('');
    setExpected('');
    setActual('');
    setWhere('');
    setDevice('');
    setErrors('');
    setSeverity('');
    setImprovement('');
    setError(null);
    setSent(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const endpoint = process.env.NEXT_PUBLIC_BUGREPORT_ENDPOINT;
    if (!endpoint) {
      setError('Bug reports aren’t being collected right now. Please try again later.');
      return;
    }

    setLoading(true);
    try {
      const form = e.currentTarget;
      // Keys are human-readable and ordered to match the report template —
      // Formspree emails field names as-is, so these ARE the email's labels.
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `🐛 Toolshare bug report — ${severity || 'unrated'}`,
          _replyto: email,
          '1. What happened': whatHappened,
          '2. Steps to reproduce': steps,
          '3. Expected': expected,
          '3. Actual': actual,
          '4. Screen / page / URL': where,
          '4. App version': APP_VERSION,
          '4. Device & OS': device,
          '5. Error messages': errors,
          '6. How bad is it': severity,
          '7. Improvement ideas': improvement,
          'Reported by': email || user?.email || 'unknown',
          // Captured rather than asked for — accurate, and free for the tester.
          'Browser user agent': typeof navigator === 'undefined' ? '' : navigator.userAgent,
          _gotcha: (form.elements.namedItem('_gotcha') as HTMLInputElement | null)?.value ?? '',
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          errors?: { message?: string }[];
        } | null;
        throw new Error(body?.errors?.[0]?.message ?? 'Could not send the bug report');
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the bug report');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md border border-border bg-surface p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-success-100">
          <BugPlay className="size-6 text-success-600" aria-hidden="true" />
        </div>
        <p className="font-heading text-lg font-semibold">Report sent — thank you!</p>
        <p className="text-sm text-muted-foreground">
          This is genuinely useful. If we need more detail we&apos;ll reply to {email}.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button onClick={resetForm}>Report another bug</Button>
          <Link href="/">
            <Button variant="outline">Back to browsing</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <Section number="1" title="What happened?">
        <FormField
          label="In a sentence or two: what were you doing, and what went wrong?"
          required
        >
          <Textarea
            rows={3}
            value={whatHappened}
            onChange={(e) => setWhatHappened(e.target.value)}
            required
          />
        </FormField>
      </Section>

      <Section number="2" title="Steps to reproduce">
        <FormField
          label="Walk me through it like you’re telling a friend"
          helperText="Numbered steps are great, but a quick paragraph works too."
        >
          <Textarea
            rows={5}
            placeholder={'1.\n2.\n3.'}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
          />
        </FormField>
      </Section>

      <Section number="3" title="What did you expect vs. what actually happened?">
        <FormField label="Expected">
          <Textarea
            rows={2}
            value={expected}
            onChange={(e) => setExpected(e.target.value)}
          />
        </FormField>
        <FormField label="Actual">
          <Textarea rows={2} value={actual} onChange={(e) => setActual(e.target.value)} />
        </FormField>
      </Section>

      <Section number="4" title="Where did this happen?">
        <FormField label="Screen / page / URL">
          <Input type="text" value={where} onChange={(e) => setWhere(e.target.value)} />
        </FormField>
        <FormField label="Device & OS" helperText="e.g. iPhone 15, iOS 18.1 / Windows 11, Chrome">
          <Input type="text" value={device} onChange={(e) => setDevice(e.target.value)} />
        </FormField>
        <p className="text-sm text-muted-foreground">
          App version: <span className="font-medium text-foreground">{APP_VERSION}</span> — sent
          automatically, along with your browser version.
        </p>
      </Section>

      <Section number="5" title="Any error messages?">
        <FormField
          label="Copy/paste the exact text"
          helperText="If a screenshot is easier, say so here and reply to our email with it attached."
        >
          <Textarea rows={3} value={errors} onChange={(e) => setErrors(e.target.value)} />
        </FormField>
      </Section>

      <Section number="6" title="How bad is it?">
        <div role="radiogroup" aria-labelledby="severity-heading" className="flex flex-col gap-3">
          <span id="severity-heading" className="sr-only">
            How bad is it?
          </span>
          {SEVERITIES.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-start gap-3">
              <Radio
                name="severity"
                className="mt-0.5"
                value={option.value}
                checked={severity === option.value}
                onChange={(e) => setSeverity(e.target.value)}
                required
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section number="7" title="Anything you’d love to see improved?">
        <FormField label="Not a bug, just a “hey it’d be cool if…”">
          <Textarea
            rows={3}
            value={improvement}
            onChange={(e) => setImprovement(e.target.value)}
          />
        </FormField>
      </Section>

      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <FormField
          label="Your email"
          helperText="Where we’ll reply if we need more detail."
          required
        >
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormField>

        {error ? <Alert variant="danger">{error}</Alert> : null}

        <Button type="submit" size="lg" isLoading={loading} className="w-full sm:w-auto sm:self-start">
          {loading ? 'Sending…' : 'Send bug report'}
        </Button>
      </div>
    </form>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-lg font-semibold">
        <span className="text-primary">{number}.</span> {title}
      </h2>
      {children}
    </section>
  );
}
