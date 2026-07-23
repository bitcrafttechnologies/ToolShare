'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { Tool, PaymentMethodType } from '@toolshare/types';
import type { PriceSummary } from '@toolshare/domain';
import { Components } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { createPaymentRepository } from '@toolshare/supabase';

const { Button, Card, Spinner } = Components;

// Lazy so the cash-only path never triggers Stripe.js: this only runs the
// first time the card branch actually mounts <Elements>.
let stripePromiseSingleton: ReturnType<typeof loadStripe> | null = null;
function getStripe() {
  stripePromiseSingleton ??= loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  return stripePromiseSingleton;
}

interface Props {
  tool: Tool;
  summary: PriceSummary;
  startDate: string;
  endDate: string;
  paymentMethod: PaymentMethodType;
  onBack: () => void;
  onSuccess: (bookingId: string) => void;
  onError: (msg: string) => void;
  createBooking: ReturnType<typeof import('@toolshare/supabase').useCreateBooking>;
}

export function PaymentStep(props: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);

  async function prepare() {
    setPreparing(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const booking = await props.createBooking.mutateAsync({
        tool_id: props.tool.id,
        renter_id: user.id,
        owner_id: props.tool.owner_id,
        start_date: props.startDate,
        end_date: props.endDate,
        total_price: props.summary.subtotal,
        deposit_amount: props.summary.deposit,
        payment_method: props.paymentMethod,
      });

      setBookingId(booking.id);

      if (props.paymentMethod !== 'in_person') {
        const payRepo = createPaymentRepository(supabase);
        const intent = await payRepo.createPaymentIntent(booking.id);
        setClientSecret(intent.clientSecret);
      } else {
        props.onSuccess(booking.id);
      }
    } catch (err) {
      props.onError(err instanceof Error ? err.message : 'Failed to prepare booking');
    } finally {
      setPreparing(false);
    }
  }

  if (preparing) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Spinner />
        <p className="text-sm text-muted-foreground">Preparing your booking…</p>
      </div>
    );
  }

  // Cash-only path: no money moves online. Confirm and create the request
  // (pending) for the owner to approve.
  const isCash = props.paymentMethod === 'in_person';

  if (!clientSecret && !bookingId) {
    return (
      <div>
        <h2 className="mb-6 font-heading text-xl font-bold">
          {isCash ? 'Confirm your request' : 'Payment'}
        </h2>
        <Card className="mb-6 p-4">
          <div className="flex justify-between gap-4 font-semibold">
            <span>{isCash ? 'Pay in cash at pickup' : 'Total due today'}</span>
            <span>${props.summary.total.toFixed(2)}</span>
          </div>
          {isCash ? (
            <p className="mt-2 text-xs text-muted-foreground">
              You&apos;ll pay the owner directly when you collect the tool
              {props.summary.deposit > 0
                ? `, including a $${props.summary.deposit.toFixed(2)} deposit returned when you bring it back.`
                : '.'}{' '}
              Nothing is charged online.
            </p>
          ) : props.summary.deposit > 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Includes a ${props.summary.deposit.toFixed(2)} refundable deposit, released when the
              tool is returned.
            </p>
          ) : null}
        </Card>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" onClick={props.onBack} className="flex-1">
            Back
          </Button>
          <Button size="lg" onClick={prepare} className="flex-1">
            {isCash ? 'Send request' : 'Proceed to payment'}
          </Button>
        </div>
      </div>
    );
  }

  if (clientSecret && bookingId) {
    return (
      <Elements stripe={getStripe()} options={{ clientSecret }}>
        <StripePaymentForm
          bookingId={bookingId}
          onBack={props.onBack}
          onSuccess={props.onSuccess}
          onError={props.onError}
        />
      </Elements>
    );
  }

  return null;
}

function StripePaymentForm({
  bookingId,
  onBack,
  onSuccess,
  onError,
}: {
  bookingId: string;
  onBack: () => void;
  onSuccess: (id: string) => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });
      if (error) throw new Error(error.message);
      if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'requires_capture') {
        const supabase = getSupabaseBrowserClient();
        const payRepo = createPaymentRepository(supabase);
        await payRepo.confirmBooking(bookingId, paymentIntent.id);
        onSuccess(bookingId);
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="mb-6 font-heading text-xl font-bold">Payment</h2>
      <div className="mb-6">
        <PaymentElement />
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={!stripe}
          isLoading={loading}
          className="flex-1"
        >
          {loading ? 'Processing…' : 'Pay now'}
        </Button>
      </div>
    </form>
  );
}
