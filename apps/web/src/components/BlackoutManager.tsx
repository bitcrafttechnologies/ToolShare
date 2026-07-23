'use client';

import { useState } from 'react';
import { CalendarOff, Trash2, Lock } from 'lucide-react';
import { useBlockedDates, useCreateBlockedDate, useDeleteBlockedDate } from '@toolshare/supabase';
import { Components } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { DateRangePicker } from '@/components/DateRangePicker';
import { formatDateRange } from '@/lib/format';

const { Button, Alert, Separator } = Components;

/**
 * Owner-facing blackout dates. Rows fall in two buckets:
 *  - manual blackouts (booking_id null) the owner can remove;
 *  - rental blocks (booking_id set, auto-created on confirm) shown read-only,
 *    because removing one would let the tool be double-booked.
 */
export function BlackoutManager({ toolId }: { toolId: string }) {
  const supabase = getSupabaseBrowserClient();
  const { data: blocked = [] } = useBlockedDates(supabase, toolId);
  const createBlackout = useCreateBlockedDate(supabase, toolId);
  const deleteBlackout = useDeleteBlockedDate(supabase, toolId);

  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const manual = blocked.filter((b) => !b.booking_id);
  const booked = blocked.filter((b) => b.booking_id);

  function add() {
    if (!start || !end) return;
    createBlackout.mutate(
      { startDate: start, endDate: end },
      {
        onSuccess: () => {
          setStart('');
          setEnd('');
        },
      },
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
          <CalendarOff size={18} aria-hidden="true" />
          Availability &amp; blackouts
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Block dates the tool can&apos;t be rented — when you&apos;re using it, it&apos;s in for
          repair, or you&apos;re away. Renters can&apos;t request these days.
        </p>
      </div>

      {createBlackout.isError || deleteBlackout.isError ? (
        <Alert variant="danger">Couldn&apos;t update blackout dates. Please try again.</Alert>
      ) : null}

      {blocked.length > 0 ? (
        <ul className="flex list-none flex-col gap-2 pl-0">
          {manual.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-3 rounded-sm border border-border bg-surface p-3"
            >
              <span className="text-sm font-medium">{formatDateRange(b.start_date, b.end_date)}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove blackout ${formatDateRange(b.start_date, b.end_date)}`}
                isLoading={deleteBlackout.isPending && deleteBlackout.variables === b.id}
                onClick={() => deleteBlackout.mutate(b.id)}
              >
                <Trash2 size={16} className="text-danger-600" aria-hidden="true" />
              </Button>
            </li>
          ))}
          {booked.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-3 rounded-sm border border-border bg-surface-muted p-3"
            >
              <span className="text-sm font-medium text-muted-foreground">
                {formatDateRange(b.start_date, b.end_date)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Lock size={12} aria-hidden="true" /> Booked
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No blocked dates. The tool is bookable any day.</p>
      )}

      <Separator />

      <div>
        <p className="mb-2 text-sm font-medium">Add a blackout</p>
        <div className="flex flex-col items-start gap-3">
          <DateRangePicker
            toolId={toolId}
            startDate={start}
            endDate={end}
            onChange={(s, e) => {
              setStart(s);
              setEnd(e);
            }}
          />
          <Button
            disabled={!start || !end}
            isLoading={createBlackout.isPending}
            onClick={add}
          >
            {start && end ? `Block ${formatDateRange(start, end)}` : 'Select dates to block'}
          </Button>
        </div>
      </div>
    </section>
  );
}
