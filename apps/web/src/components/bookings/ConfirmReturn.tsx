'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBooking, useConfirmReturn } from '@toolshare/supabase';
import { RETURN_CONDITION_LABELS, type ReturnCondition } from '@toolshare/types';
import { Components } from '@toolshare/ui';
import { cn } from '@toolshare/lib';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';
import { ToolPhotoPicker, uploadToolPhotos } from '@/components/ToolPhotoPicker';

const { Button, Card, EmptyState, Spinner, Textarea, Alert } = Components;

interface Props {
  bookingId: string;
}

const CONDITIONS = Object.keys(RETURN_CONDITION_LABELS) as ReturnCondition[];

export function ConfirmReturn({ bookingId }: Props) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const user = useSessionUser();
  const { data: booking, isLoading } = useBooking(supabase, bookingId);
  const confirmReturn = useConfirmReturn(supabase);

  const [condition, setCondition] = useState<ReturnCondition | null>(null);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading || user === null) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  // Only the owner, and only while the rental is active, can confirm a return.
  if (!booking || booking.owner_id !== user.id || booking.booking_status !== 'active') {
    return (
      <EmptyState
        title="Nothing to confirm here"
        description="This booking isn't awaiting a return confirmation."
        action={
          <Link
            href={`/bookings/${bookingId}`}
            className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
          >
            Back to booking
          </Link>
        }
      />
    );
  }

  async function submit() {
    if (!condition) return;
    setSubmitting(true);
    setError(null);
    try {
      const photoUrls = photos.length ? await uploadToolPhotos(supabase, user!.id, photos) : [];
      await confirmReturn.mutateAsync({
        id: bookingId,
        condition,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        ...(photoUrls.length ? { photoUrls } : {}),
      });
      // Straight to the review step — the natural next action.
      router.push(`/bookings/${bookingId}/review`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm the return');
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link
        href={`/bookings/${bookingId}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600"
      >
        <span aria-hidden="true">←</span> Booking
      </Link>

      <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight">Confirm return</h1>
      <p className="mt-2 text-muted-foreground">
        Confirm you&apos;ve received{' '}
        <span className="font-medium text-foreground">{booking.tool?.title ?? 'the tool'}</span>{' '}
        back and record the condition it came home in.
      </p>

      <Card className="mt-6 flex flex-col gap-6 p-6">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Condition on return</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CONDITIONS.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={condition === c}
                onClick={() => setCondition(c)}
                className={cn(
                  'rounded-sm border px-3 py-2 text-sm font-medium transition-colors',
                  condition === c
                    ? c === 'damaged'
                      ? 'border-danger-400 bg-danger-50 text-danger-600'
                      : 'border-primary bg-primary-50 text-primary'
                    : 'border-border text-foreground hover:border-primary-400',
                )}
              >
                {RETURN_CONDITION_LABELS[c]}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="return-notes" className="mb-2 block text-sm font-medium">
            Notes <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            id="return-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              condition === 'damaged'
                ? 'Describe the damage and any deposit deduction you agreed on.'
                : 'Anything worth noting about the return?'
            }
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">
            Return photos <span className="font-normal text-muted-foreground">(optional)</span>
          </p>
          <ToolPhotoPicker files={photos} onChange={setPhotos} disabled={submitting} />
          <p className="mt-2 text-xs text-muted-foreground">
            A quick photo of the returned tool protects both of you if a deposit question comes up.
          </p>
        </div>

        {booking.deposit_amount > 0 ? (
          <p className="rounded-sm border border-border bg-surface-muted p-3 text-sm text-muted-foreground">
            Remember to return the ${booking.deposit_amount.toFixed(2)} cash deposit
            {condition === 'damaged' ? ', minus anything you both agreed for damage' : ''}.
          </p>
        ) : null}

        {error ? <Alert variant="danger">{error}</Alert> : null}

        <Button size="lg" disabled={!condition} isLoading={submitting} onClick={() => void submit()}>
          Confirm return
        </Button>
      </Card>
    </div>
  );
}
