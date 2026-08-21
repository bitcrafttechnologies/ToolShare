'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import {
  usePendingRequestCount,
  createBookingRepository,
  bookingKeys,
} from '@toolshare/supabase';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';

/**
 * Header "Bookings" link with a live badge for pending requests on the user's
 * own listings — so a lender is notified the moment someone requests to book,
 * without refreshing. (The `bookings` table is in the realtime publication.)
 */
export function BookingsNotifier() {
  const supabase = getSupabaseBrowserClient();
  const qc = useQueryClient();
  const user = useSessionUser();
  const { data: count = 0, isError, error } = usePendingRequestCount(supabase, user?.id);

  // Previously swallowed entirely — a failed count silently read as "no
  // pending requests" with nothing in the console to say why (TKT-00009).
  // The badge itself still just omits rather than showing an error state;
  // it's a background poll, not something worth interrupting the header for.
  useEffect(() => {
    if (isError) console.error('[toolshare] pending booking count failed:', error);
  }, [isError, error]);

  useEffect(() => {
    if (!user) return;
    const repo = createBookingRepository(supabase);
    return repo.subscribeToOwnerBookings(user.id, () => {
      void qc.invalidateQueries({ queryKey: bookingKeys.pendingCount(user.id) });
      void qc.invalidateQueries({ queryKey: bookingKeys.forOwner(user.id) });
    });
  }, [supabase, qc, user]);

  return (
    <Link
      href="/bookings"
      className="relative rounded-sm px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted hover:text-primary"
    >
      Bookings
      {count > 0 ? (
        <span
          aria-label={`${count} pending request${count === 1 ? '' : 's'}`}
          className="absolute -right-0.5 top-0 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground"
        >
          {count > 9 ? '9+' : count}
        </span>
      ) : null}
    </Link>
  );
}
