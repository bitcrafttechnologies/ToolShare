'use client';

import { useBlockedDates } from '@toolshare/supabase';
import { checkToolAvailability } from '@toolshare/domain';
import { Components } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Tool } from '@toolshare/types';
import { DateRangePicker } from '@/components/DateRangePicker';
import { formatDateRange } from '@/lib/format';

const { Button, Alert } = Components;

interface Props {
  tool: Tool;
  startDate: string;
  endDate: string;
  onDatesChange: (start: string, end: string) => void;
  onNext: () => void;
}

export function DateSelectionStep({ tool, startDate, endDate, onDatesChange, onNext }: Props) {
  const supabase = getSupabaseBrowserClient();
  const { data: blockedDates = [] } = useBlockedDates(supabase, tool.id);

  const datesValid = Boolean(startDate && endDate && endDate >= startDate);
  // Belt-and-suspenders: the calendar already disables blocked days, but
  // re-check in case a range straddles one.
  const availability = datesValid
    ? checkToolAvailability(blockedDates, new Date(startDate), new Date(endDate))
    : null;
  const unavailable = availability !== null && !availability.isAvailable;

  return (
    <div>
      <h2 className="mb-2 font-heading text-xl font-bold">Select rental dates</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Pick your pickup and return days. Greyed-out days are already booked or blocked.
      </p>

      <div className="mb-6 flex justify-center">
        <DateRangePicker
          toolId={tool.id}
          startDate={startDate}
          endDate={endDate}
          onChange={onDatesChange}
        />
      </div>

      <p className="mb-4 text-center text-sm">
        {datesValid ? (
          <span className="font-medium">{formatDateRange(startDate, endDate)}</span>
        ) : (
          <span className="text-muted-foreground">
            {startDate ? 'Now pick a return day' : 'Select your pickup day to start'}
          </span>
        )}
      </p>

      {unavailable ? (
        <Alert variant="danger" className="mb-4">
          Part of that range isn&apos;t available. Please choose different dates.
        </Alert>
      ) : null}

      <Button onClick={onNext} disabled={!datesValid || unavailable} size="lg" className="w-full">
        Continue
      </Button>
    </div>
  );
}
