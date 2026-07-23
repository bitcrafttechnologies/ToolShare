'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Components } from '@toolshare/ui';
import { useTool, useCreateBooking } from '@toolshare/supabase';
import { calculateBookingPrice, verifyAgeAndLicense } from '@toolshare/domain';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';
import type { PaymentMethodType } from '@toolshare/types';
import { ONLINE_PAYMENTS_ENABLED } from '@/lib/flags';
import { DateSelectionStep } from './DateSelectionStep';
import { ReviewStep } from './ReviewStep';
import { WaiverStep } from './WaiverStep';
import { PaymentStep } from './PaymentStep';
import { ConfirmationStep } from './ConfirmationStep';

const { Spinner, EmptyState, Alert } = Components;

type Step = 'dates' | 'review' | 'waiver' | 'payment' | 'confirmation';

const STEP_LABELS: Record<Step, string> = {
  dates: 'Dates',
  review: 'Review',
  waiver: 'Waiver',
  // The final action step submits a payment when payments are on, and a
  // pay-on-pickup request when they're off — label it for what it does.
  payment: ONLINE_PAYMENTS_ENABLED ? 'Payment' : 'Confirm',
  confirmation: 'Done',
};

interface Props {
  toolId: string;
  // `| undefined` so a page can forward an absent search param directly
  // (the repo sets exactOptionalPropertyTypes).
  initialStart?: string | undefined;
  initialEnd?: string | undefined;
}

export function BookingFlow({ toolId, initialStart, initialEnd }: Props) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const user = useSessionUser();
  const { data: tool, isLoading } = useTool(supabase, toolId);
  const createBooking = useCreateBooking(supabase);

  const [step, setStep] = useState<Step>('dates');
  const [startDate, setStartDate] = useState(initialStart ?? '');
  const [endDate, setEndDate] = useState(initialEnd ?? '');
  // Cash-only pilot pins this to in_person; the ReviewStep picker (hidden
  // behind the same flag) is what would otherwise change it.
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    ONLINE_PAYMENTS_ENABLED ? 'stripe_card' : 'in_person',
  );
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
        <span className="sr-only">Loading tool…</span>
      </div>
    );
  }
  if (!tool) {
    return (
      <EmptyState
        title="Tool not found"
        description="This listing may have been removed. Try browsing what's available nearby."
        action={
          <Link
            href="/search"
            className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
          >
            Browse tools
          </Link>
        }
      />
    );
  }

  // Owners can't rent their own tool (also blocked by a DB check constraint).
  if (user && user.id === tool.owner_id) {
    return (
      <EmptyState
        title="This is your listing"
        description="You can't rent a tool you own. You can edit it or manage its availability instead."
        action={
          <Link
            href={`/tools/${tool.id}/edit`}
            className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
          >
            Edit listing
          </Link>
        }
      />
    );
  }

  const summary =
    startDate && endDate
      ? calculateBookingPrice(tool, new Date(startDate), new Date(endDate))
      : null;

  const STEPS: Step[] = ['dates', 'review', 'waiver', 'payment', 'confirmation'];
  const stepIndex = STEPS.indexOf(step);

  return (
    <div>
      <ol className="mb-8 flex list-none items-center pl-0" aria-label="Booking progress">
        {STEPS.slice(0, -1).map((s, i) => (
          <li key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                aria-current={i === stepIndex ? 'step' : undefined}
                className={
                  i < stepIndex
                    ? 'flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground'
                    : i === stepIndex
                      ? 'flex size-8 items-center justify-center rounded-full border-2 border-primary text-sm font-semibold text-primary'
                      : 'flex size-8 items-center justify-center rounded-full bg-surface-muted text-sm font-semibold text-muted-foreground'
                }
              >
                {i < stepIndex ? '✓' : i + 1}
              </span>
              <span
                className={
                  i <= stepIndex
                    ? 'text-xs font-medium text-foreground'
                    : 'text-xs text-muted-foreground'
                }
              >
                {STEP_LABELS[s]}
              </span>
            </div>
            {i < STEPS.length - 2 ? (
              <div
                aria-hidden="true"
                className={
                  i < stepIndex
                    ? 'mx-2 -mt-5 h-0.5 flex-1 bg-primary'
                    : 'mx-2 -mt-5 h-0.5 flex-1 bg-border'
                }
              />
            ) : null}
          </li>
        ))}
      </ol>

      {error ? (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      ) : null}

      {step === 'dates' && (
        <DateSelectionStep
          tool={tool}
          startDate={startDate}
          endDate={endDate}
          onDatesChange={(s, e) => { setStartDate(s); setEndDate(e); }}
          onNext={() => setStep('review')}
        />
      )}

      {step === 'review' && summary && (
        <ReviewStep
          tool={tool}
          summary={summary}
          startDate={startDate}
          endDate={endDate}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          onBack={() => setStep('dates')}
          onNext={() => setStep('waiver')}
        />
      )}

      {step === 'waiver' && (
        <WaiverStep
          tool={tool}
          accepted={waiverAccepted}
          onAcceptChange={setWaiverAccepted}
          onBack={() => setStep('review')}
          onNext={() => setStep('payment')}
        />
      )}

      {step === 'payment' && summary && (
        <PaymentStep
          tool={tool}
          summary={summary}
          startDate={startDate}
          endDate={endDate}
          paymentMethod={paymentMethod}
          onBack={() => setStep('waiver')}
          onSuccess={(id) => { setBookingId(id); setStep('confirmation'); }}
          onError={setError}
          createBooking={createBooking}
        />
      )}

      {step === 'confirmation' && bookingId && (
        <ConfirmationStep
          bookingId={bookingId}
          onViewBooking={() => router.push(`/bookings/${bookingId}`)}
          onHome={() => router.push('/')}
        />
      )}
    </div>
  );
}
