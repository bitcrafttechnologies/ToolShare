'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  MessageSquare,
  Package,
  ImageOff,
  PackageCheck,
  RotateCcw,
  Star,
  MapPin,
  Navigation,
  Truck,
  Check,
} from 'lucide-react';
import {
  useBooking,
  useUpdateBookingStatus,
  useRequestReturn,
  bookingKeys,
} from '@toolshare/supabase';
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  RETURN_CONDITION_LABELS,
} from '@toolshare/types';
import { Components } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';
import { formatDate, formatDateRange } from '@/lib/format';

const { Avatar, Button, Card, EmptyState, Spinner, BookingStatusBadge, Badge, Alert } = Components;

interface Props {
  bookingId: string;
}

// confirmed/active/completed all mean "the owner has agreed" — the point at
// which it's safe to reveal the address for coordination.
const APPROVED = new Set(['confirmed', 'active', 'completed']);

export function BookingDetail({ bookingId }: Props) {
  const supabase = getSupabaseBrowserClient();
  const qc = useQueryClient();
  const user = useSessionUser();
  const { data: booking, isLoading } = useBooking(supabase, bookingId);
  const updateStatus = useUpdateBookingStatus(supabase);
  const requestReturn = useRequestReturn(supabase);

  // Live status: the bookings table is in the realtime publication, so reflect
  // approvals/returns the moment the other party acts, no refresh needed.
  useEffect(() => {
    const channel = supabase
      .channel(`booking:${bookingId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${bookingId}` },
        () => {
          void qc.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, qc, bookingId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
        <span className="sr-only">Loading booking…</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <EmptyState
        title="Booking not found"
        description="It may have been cancelled or removed."
        action={
          <Link
            href="/bookings"
            className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
          >
            Back to bookings
          </Link>
        }
      />
    );
  }

  const isOwner = user?.id === booking.owner_id;
  const counterparty = isOwner ? booking.renter : booking.owner;
  const canCancel =
    booking.booking_status === 'pending' || booking.booking_status === 'confirmed';
  const photo = booking.tool?.photo_urls?.[0];
  const address = booking.tool?.address_display;
  const showCoordination = APPROVED.has(booking.booking_status);
  const returnRequested = Boolean(booking.return_requested_at);

  return (
    <div>
      <Link
        href="/bookings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600"
      >
        <span aria-hidden="true">←</span> All bookings
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          {isOwner ? 'Rental request' : 'Your booking'}
        </h1>
        <BookingStatusBadge status={booking.booking_status} />
      </div>

      {updateStatus.isError || requestReturn.isError ? (
        <Alert variant="danger" className="mt-4">
          Couldn&apos;t update this booking. Please try again.
        </Alert>
      ) : null}

      {/* Tool */}
      <Card className="mt-6 flex gap-4 p-3">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-sm bg-surface-muted">
          {photo ? (
            <Image src={photo} alt="" fill className="object-cover" sizes="80px" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImageOff size={20} aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          {booking.tool_id ? (
            <Link
              href={`/tools/${booking.tool_id}`}
              className="truncate font-heading font-semibold text-foreground hover:text-primary"
            >
              {booking.tool?.title ?? 'Tool'}
            </Link>
          ) : (
            <span className="truncate font-heading font-semibold">
              {booking.tool?.title ?? 'Tool'}
            </span>
          )}
        </div>
      </Card>

      {/* Dates + pickup */}
      <Card className="mt-4 flex flex-col gap-3 p-4">
        <p className="flex items-center gap-3 text-sm">
          <Calendar size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          {formatDateRange(booking.start_date, booking.end_date)}
        </p>
        <p className="flex items-center gap-3 text-sm">
          <Package size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          {booking.pickup_type}
        </p>
      </Card>

      {/* Coordination — address only revealed once the owner has approved. */}
      {showCoordination ? (
        <Card className="mt-4 p-4">
          <h2 className="mb-3 flex items-center gap-2 font-heading font-semibold">
            <MapPin size={18} aria-hidden="true" />
            Pickup &amp; delivery
          </h2>
          {address ? (
            <p className="text-sm">{address}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isOwner ? 'Add an address to your listing so renters can find you.' : 'Ask the owner where to meet in the chat.'}
            </p>
          )}

          <ul className="mt-3 flex flex-wrap gap-2">
            {booking.tool?.pickup_available ? (
              <li>
                <Badge variant="neutral">
                  <Package size={12} aria-hidden="true" /> Pickup
                </Badge>
              </li>
            ) : null}
            {booking.tool?.delivery_available ? (
              <li>
                <Badge variant="neutral">
                  <Truck size={12} aria-hidden="true" /> Delivery
                  {booking.tool.delivery_radius_miles
                    ? ` within ${booking.tool.delivery_radius_miles} mi`
                    : ''}
                </Badge>
              </li>
            ) : null}
          </ul>

          {address ? (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600"
            >
              <Navigation size={14} aria-hidden="true" />
              Get directions
            </a>
          ) : null}

          <p className="mt-3 text-xs text-muted-foreground">
            Sort out the exact spot and time with {counterparty?.display_name ?? 'the other person'}{' '}
            in the chat.
          </p>
        </Card>
      ) : null}

      {/* Return summary — once completed */}
      {booking.booking_status === 'completed' && booking.return_condition ? (
        <Card className="mt-4 p-4">
          <h2 className="mb-3 flex items-center gap-2 font-heading font-semibold">
            <Check size={18} className="text-success-600" aria-hidden="true" />
            Returned
          </h2>
          <p className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Condition:</span>
            <Badge variant={booking.return_condition === 'damaged' ? 'danger' : 'success'}>
              {RETURN_CONDITION_LABELS[booking.return_condition]}
            </Badge>
          </p>
          {booking.return_notes ? (
            <p className="mt-2 text-sm text-muted-foreground">{booking.return_notes}</p>
          ) : null}
          {booking.return_photo_urls.length > 0 ? (
            <ul className="mt-3 flex list-none flex-wrap gap-2 pl-0">
              {booking.return_photo_urls.map((url, i) => (
                <li key={url} className="relative size-16 overflow-hidden rounded-sm bg-surface-muted">
                  <Image src={url} alt={`Return photo ${i + 1}`} fill className="object-cover" sizes="64px" />
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      ) : null}

      {/* Payment */}
      <Card className="mt-4 p-4">
        <h2 className="mb-3 font-heading font-semibold">Payment</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Rental</dt>
            <dd>${booking.total_price.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Deposit (refundable)</dt>
            <dd>${booking.deposit_amount.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>${(booking.total_price + booking.deposit_amount).toFixed(2)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">
          {PAYMENT_METHOD_LABELS[booking.payment_method]} · {booking.payment_status}
        </p>
      </Card>

      {/* Counterparty */}
      {counterparty ? (
        <Card className="mt-4 flex items-center gap-3 p-4">
          <Avatar src={counterparty.avatar_url ?? undefined} name={counterparty.display_name} />
          <div>
            <p className="font-medium">{counterparty.display_name}</p>
            <p className="text-sm text-muted-foreground">{isOwner ? 'Renter' : 'Owner'}</p>
          </div>
        </Card>
      ) : null}

      <div className="mt-6 flex flex-col gap-3">
        <Link href={`/bookings/${booking.id}/chat`}>
          <Button variant="outline" size="lg" className="w-full">
            <MessageSquare size={16} aria-hidden="true" />
            Message {isOwner ? 'renter' : 'owner'}
          </Button>
        </Link>

        {isOwner && booking.booking_status === 'pending' ? (
          <div className="flex gap-3">
            {/* Only the affirmative action is filled — the danger token reads
                too close to primary terracotta to distinguish two solid buttons. */}
            <Button
              variant="outline"
              size="lg"
              className="flex-1 text-danger-600 hover:bg-danger-50"
              isLoading={updateStatus.isPending}
              onClick={() => updateStatus.mutate({ id: booking.id, status: 'cancelled' })}
            >
              Decline
            </Button>
            <Button
              size="lg"
              className="flex-1"
              isLoading={updateStatus.isPending}
              onClick={() => updateStatus.mutate({ id: booking.id, status: 'confirmed' })}
            >
              Approve
            </Button>
          </div>
        ) : null}

        {isOwner && booking.booking_status === 'confirmed' ? (
          <Button
            size="lg"
            isLoading={updateStatus.isPending}
            onClick={() => updateStatus.mutate({ id: booking.id, status: 'active' })}
          >
            <PackageCheck size={16} aria-hidden="true" />
            Mark as picked up
          </Button>
        ) : null}

        {/* Active rental — the return handshake. */}
        {booking.booking_status === 'active' ? (
          isOwner ? (
            <>
              {returnRequested ? (
                <p className="rounded-sm border border-primary-200 bg-primary-50 p-3 text-sm text-primary-700">
                  {counterparty?.display_name ?? 'The renter'} marked this returned — confirm you
                  received it and record its condition.
                </p>
              ) : null}
              <Link href={`/bookings/${booking.id}/return`}>
                <Button size="lg" className="w-full">
                  <RotateCcw size={16} aria-hidden="true" />
                  Confirm return &amp; condition
                </Button>
              </Link>
            </>
          ) : returnRequested ? (
            <p className="rounded-sm border border-border bg-surface-muted p-3 text-center text-sm text-muted-foreground">
              You marked this returned. Waiting for {counterparty?.display_name ?? 'the owner'} to
              confirm receipt.
            </p>
          ) : (
            <Button
              size="lg"
              isLoading={requestReturn.isPending}
              onClick={() => requestReturn.mutate(booking.id)}
            >
              <RotateCcw size={16} aria-hidden="true" />
              I&apos;ve returned it
            </Button>
          )
        ) : null}

        {booking.booking_status === 'completed' ? (
          <Link href={`/bookings/${booking.id}/review`}>
            <Button size="lg" className="w-full">
              <Star size={16} aria-hidden="true" />
              Leave a review
            </Button>
          </Link>
        ) : null}

        {!isOwner && canCancel ? (
          <Button
            variant="ghost"
            size="lg"
            isLoading={updateStatus.isPending}
            onClick={() => updateStatus.mutate({ id: booking.id, status: 'cancelled' })}
          >
            Cancel booking
          </Button>
        ) : null}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {BOOKING_STATUS_LABELS[booking.booking_status]}
        {booking.created_at ? ` · Booked ${formatDate(booking.created_at.slice(0, 10))}` : ''}
      </p>
    </div>
  );
}
