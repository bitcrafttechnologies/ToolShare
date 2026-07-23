'use client';

import Link from 'next/link';
import { useBookingsForOwner, useBookingsForRenter } from '@toolshare/supabase';
import type { Booking } from '@toolshare/types';
import { Components } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';
import { BookingRow } from '@/components/bookings/BookingRow';

const { Tabs, TabsList, TabsTrigger, TabsPanel, Spinner, EmptyState } = Components;

/**
 * Renter and lender views of the same bookings table.
 *
 * The Expo app only shows the renter side; on desktop there's room for
 * both, and `useBookingsForOwner` already exists — a lending marketplace
 * where you can't see requests on your own tools is half an app.
 */
export function BookingsView() {
  const supabase = getSupabaseBrowserClient();
  const user = useSessionUser();

  const renter = useBookingsForRenter(supabase, user?.id ?? '');
  const owner = useBookingsForOwner(supabase, user?.id ?? '');

  if (!user) {
    return (
      <EmptyState
        className="mt-8"
        title="Sign in to see your bookings"
        description="Your rentals and incoming requests live here once you're signed in."
        action={
          <Link
            href="/login?next=/bookings"
            className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
          >
            Sign in
          </Link>
        }
      />
    );
  }

  return (
    <Tabs defaultValue="renting" className="mt-8">
      <TabsList>
        <TabsTrigger value="renting">
          Renting{renter.data?.length ? ` (${renter.data.length})` : ''}
        </TabsTrigger>
        <TabsTrigger value="lending">
          Lending{owner.data?.length ? ` (${owner.data.length})` : ''}
        </TabsTrigger>
      </TabsList>

      <TabsPanel value="renting">
        <BookingList
          bookings={renter.data}
          isLoading={renter.isLoading}
          perspective="renter"
          emptyTitle="No rentals yet"
          emptyDescription="When you book a tool it'll show up here with its pickup details."
          emptyActionLabel="Browse tools"
          emptyActionHref="/search"
        />
      </TabsPanel>

      <TabsPanel value="lending">
        <BookingList
          bookings={owner.data}
          isLoading={owner.isLoading}
          perspective="owner"
          emptyTitle="No requests yet"
          emptyDescription="Requests from renters on your listings will appear here."
          emptyActionLabel="Add a listing"
          emptyActionHref="/add-tool"
        />
      </TabsPanel>
    </Tabs>
  );
}

function BookingList({
  bookings,
  isLoading,
  perspective,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  emptyActionHref,
}: {
  bookings: Booking[] | undefined;
  isLoading: boolean;
  perspective: 'renter' | 'owner';
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel: string;
  emptyActionHref: string;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
        <span className="sr-only">Loading bookings…</span>
      </div>
    );
  }

  if (!bookings?.length) {
    return (
      <EmptyState
        className="mt-6"
        title={emptyTitle}
        description={emptyDescription}
        action={
          <Link
            href={emptyActionHref}
            className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
          >
            {emptyActionLabel}
          </Link>
        }
      />
    );
  }

  return (
    <ul className="mt-6 flex list-none flex-col gap-3 pl-0">
      {bookings.map((booking) => (
        <li key={booking.id}>
          <BookingRow booking={booking} perspective={perspective} />
        </li>
      ))}
    </ul>
  );
}
