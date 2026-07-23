'use client';

import { useBlockedDates } from '@toolshare/supabase';
import { Components } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const { Badge } = Components;

/**
 * "Unavailable right now" pill for the tool detail page.
 *
 * Client-side on purpose: the detail page is statically generated (ISR), so
 * a server-rendered pill off `tool.available_now` lags up to an hour behind a
 * just-added blackout or booking. This reads blocked_dates live so the pill is
 * always current — the same source the booking calendar uses.
 */
export function AvailabilityPill({
  toolId,
  isAvailable,
}: {
  toolId: string;
  isAvailable: boolean;
}) {
  const supabase = getSupabaseBrowserClient();
  const { data: blocked = [] } = useBlockedDates(supabase, toolId);

  const today = new Date().toISOString().slice(0, 10);
  const blockedToday = blocked.some((b) => b.start_date <= today && b.end_date >= today);

  if (isAvailable && !blockedToday) return null;
  return <Badge variant="neutral">Unavailable right now</Badge>;
}
