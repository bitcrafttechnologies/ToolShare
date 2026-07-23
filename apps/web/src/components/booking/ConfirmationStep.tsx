'use client';

import { Check } from 'lucide-react';
import { Components } from '@toolshare/ui';
import { ONLINE_PAYMENTS_ENABLED } from '@/lib/flags';

const { Button } = Components;

interface Props {
  bookingId: string;
  onViewBooking: () => void;
  onHome: () => void;
}

export function ConfirmationStep({ onViewBooking, onHome }: Props) {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-success-100">
        <Check className="size-8 text-success-600" aria-hidden="true" />
      </div>
      {/* With payments off the booking is created as a pending request the
          owner still has to approve — so don't tell the renter it's confirmed. */}
      <h2 className="mb-2 font-heading text-2xl font-bold">
        {ONLINE_PAYMENTS_ENABLED ? 'Booking confirmed' : 'Request sent'}
      </h2>
      <p className="mb-8 text-muted-foreground">
        {ONLINE_PAYMENTS_ENABLED
          ? 'Your rental is confirmed. The owner will be in touch with pickup details.'
          : "The owner will review your request and confirm. You'll be able to message them and arrange pickup once they approve."}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" onClick={onViewBooking} className="sm:px-8">
          View booking
        </Button>
        <Button variant="outline" size="lg" onClick={onHome} className="sm:px-8">
          Back to home
        </Button>
      </div>
    </div>
  );
}
