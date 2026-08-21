'use client';

import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';
import { useBlockedDates } from '@toolshare/supabase';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { parseDateOnly } from '@/lib/format';

interface Props {
  toolId: string;
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

/** Local-time YYYY-MM-DD (never toISOString, which shifts to UTC and can slip a day). */
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Calendar range picker for renting dates. Fetches the tool's blocked_dates
 * itself and disables them (plus past days), so a renter physically can't pick
 * a day the tool is rented out or blacked out — the availability check that
 * used to live only in validation is now enforced in the UI.
 */
export function DateRangePicker({ toolId, startDate, endDate, onChange }: Props) {
  const supabase = getSupabaseBrowserClient();
  const { data: blockedDates = [] } = useBlockedDates(supabase, toolId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected: DateRange | undefined = startDate
    ? { from: parseDateOnly(startDate), to: endDate ? parseDateOnly(endDate) : undefined }
    : undefined;

  const disabled = [
    { before: today },
    ...blockedDates.map((b) => ({ from: parseDateOnly(b.start_date), to: parseDateOnly(b.end_date) })),
  ];

  return (
    <div
      // w-fit + max-w-full: shrink-wraps to the grid's actual ~16.5rem
      // (7 × 2.25rem cells) so mx-auto can center it, and never claims more
      // than the container has (the sticky booking rail on mobile). That
      // shrink-wrap only works because the grid itself is sized off the
      // day-cell vars below rather than stretched to fill its container —
      // see the `table:not(.rdp-month_grid)` carve-out in globals.css.
      // overflow-x-auto is a fallback for anything narrower than the grid
      // (a phone under ~270px), not the primary fit mechanism.
      className="mx-auto w-fit max-w-full overflow-x-auto rounded-md border border-border bg-surface p-2"
      // Terracotta accent to match the app (react-day-picker reads these vars).
      style={
        {
          '--rdp-accent-color': 'var(--color-primary-500)',
          '--rdp-accent-background-color': 'var(--color-primary-50)',
          '--rdp-today-color': 'var(--color-primary-600)',
          '--rdp-day-width': '2.25rem',
          '--rdp-day-height': '2.25rem',
          // The clickable button inside each cell has its own size vars,
          // defaulting to 42px — wider than the 36px cell above. Left
          // unset, the button forced its column wider regardless of
          // --rdp-day-width (part of TKT-00011/12/13).
          '--rdp-day_button-width': '2.25rem',
          '--rdp-day_button-height': '2.25rem',
          '--rdp-font-family': 'inherit',
        } as React.CSSProperties
      }
    >
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={(range: DateRange | undefined) => {
          onChange(
            range?.from ? toISODate(range.from) : '',
            range?.to ? toISODate(range.to) : '',
          );
        }}
        disabled={disabled}
        startMonth={today}
      />
    </div>
  );
}
