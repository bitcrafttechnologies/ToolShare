import Link from 'next/link';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import type { Booking } from '@toolshare/types';
import { Components } from '@toolshare/ui';
import { formatDateRange } from '@/lib/format';

const { BookingStatusBadge } = Components;

interface Props {
  booking: Booking;
  /** Whose side of the deal we're showing — changes the counterparty line. */
  perspective: 'renter' | 'owner';
}

export function BookingRow({ booking, perspective }: Props) {
  const photo = booking.tool?.photo_urls?.[0];
  // BOOKING_SELECT joins owner/renter at the booking level; the nested
  // `tool` join carries no owner, so read the counterparty from the top.
  const counterparty =
    perspective === 'renter' ? booking.owner?.display_name : booking.renter?.display_name;

  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="flex gap-4 rounded-md border border-border bg-surface p-3 transition-colors hover:border-primary-400"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-sm bg-surface-muted">
        {photo ? (
          <Image src={photo} alt="" fill className="object-cover" sizes="80px" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff size={20} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="truncate font-heading font-semibold text-foreground">
            {booking.tool?.title ?? 'Tool'}
          </h3>
          <BookingStatusBadge status={booking.booking_status} className="shrink-0" />
        </div>

        <p className="text-sm text-muted-foreground">
          {formatDateRange(booking.start_date, booking.end_date)}
        </p>

        <div className="mt-auto flex items-baseline justify-between gap-3">
          <span className="truncate text-sm text-muted-foreground">
            {counterparty
              ? `${perspective === 'renter' ? 'from' : 'to'} ${counterparty}`
              : ''}
          </span>
          <span className="shrink-0 font-heading font-semibold text-primary">
            ${booking.total_price.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
