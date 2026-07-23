'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, CalendarDays, Pencil } from 'lucide-react';
import type { Tool } from '@toolshare/types';
import { calculateBookingPrice } from '@toolshare/domain';
import { Components } from '@toolshare/ui';
import { DateRangePicker } from '@/components/DateRangePicker';
import { formatDateRange } from '@/lib/format';
import { useSessionUser } from '@/hooks/useSessionUser';

const { Button } = Components;

interface Props {
  tool: Tool;
}

/**
 * Booking panel — Figma "screen-tool-detail" (2023:360) right rail.
 * Rate, a paired check-in/check-out control, the two CTAs, and a live
 * price breakdown once both dates are set.
 */
export function ToolBookingPanel({ tool }: Props) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const user = useSessionUser();
  const isOwner = user?.id === tool.owner_id;

  // A lender can't rent their own tool (also enforced by a DB check
  // constraint) — show a manage affordance instead of the booking form.
  if (isOwner) {
    return (
      <div className="sticky top-24 rounded-md border border-border bg-surface p-6 shadow-md">
        <p className="font-heading text-lg font-semibold">This is your listing</p>
        <p className="mt-1 text-sm text-muted-foreground">
          You can&apos;t book your own tool. Manage its dates, price and details instead.
        </p>
        <Link href={`/tools/${tool.id}/edit`} className="mt-4 block">
          <Button size="lg" className="w-full">
            <Pencil size={16} aria-hidden="true" />
            Edit listing
          </Button>
        </Link>
      </div>
    );
  }

  const summary =
    startDate && endDate && endDate >= startDate
      ? calculateBookingPrice(tool, new Date(startDate), new Date(endDate))
      : null;

  const rate = tool.daily_rate ?? tool.hourly_rate ?? tool.weekly_rate;
  const rateUnit = tool.daily_rate != null ? 'day' : tool.hourly_rate != null ? 'hr' : 'week';

  // Guarded so a weekly-only tool doesn't divide by a null daily rate —
  // the original computed `tool.daily_rate! * 7` and produced NaN%.
  const weeklySavingPct =
    tool.weekly_rate != null && tool.daily_rate != null && tool.daily_rate > 0
      ? Math.round((1 - tool.weekly_rate / (tool.daily_rate * 7)) * 100)
      : null;

  return (
    <div className="sticky top-24 rounded-md border border-border bg-surface p-6 shadow-md">
      <div className="mb-5">
        {rate != null ? (
          <>
            <span className="font-heading text-3xl font-bold text-primary">${rate}</span>
            <span className="text-muted-foreground"> / {rateUnit}</span>
          </>
        ) : (
          <span className="font-heading text-xl font-semibold">Contact for price</span>
        )}
        {weeklySavingPct != null && weeklySavingPct > 0 ? (
          <p className="mt-1 text-sm text-success-600">
            ${tool.weekly_rate}/week — save {weeklySavingPct}%
          </p>
        ) : null}
      </div>

      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowCalendar((v) => !v)}
          aria-expanded={showCalendar}
          className="flex w-full items-center justify-between rounded-sm border border-border p-3 text-left transition-colors hover:border-primary-400"
        >
          <span className="min-w-0">
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Dates
            </span>
            <span className="text-sm text-foreground">
              {startDate && endDate
                ? formatDateRange(startDate, endDate)
                : startDate
                  ? 'Pick a return day'
                  : 'Add your dates'}
            </span>
          </span>
          <CalendarDays size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>

        {showCalendar ? (
          <div className="mt-2 flex justify-center">
            <DateRangePicker
              toolId={tool.id}
              startDate={startDate}
              endDate={endDate}
              onChange={(s, e) => {
                setStartDate(s);
                setEndDate(e);
                if (s && e) setShowCalendar(false); // collapse once a full range is chosen
              }}
            />
          </div>
        ) : null}
      </div>

      <Link
        href={`/booking/${tool.id}${startDate && endDate ? `?start=${startDate}&end=${endDate}` : ''}`}
        className="block"
      >
        <Button size="lg" className="w-full">
          {summary ? 'Request to Borrow' : 'Check availability'}
        </Button>
      </Link>

      {/* Figma draws this as an active CTA, but the schema can't back it:
          `messages.booking_id` is NOT NULL, so a conversation only exists
          against a booking. Kept in place (disabled) rather than wired to a
          route that could never load a thread. Enabling it needs either a
          nullable booking_id or a separate conversations table. */}
      <Button variant="outline" size="lg" disabled className="mt-3 w-full">
        Message Owner
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Messaging opens once you&apos;ve made a request.
      </p>

      {summary ? (
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{summary.rateDescription}</dt>
            <dd>${summary.subtotal.toFixed(2)}</dd>
          </div>
          {summary.deposit > 0 ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Deposit (refundable)</dt>
              <dd>${summary.deposit.toFixed(2)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 border-t border-border pt-2 font-semibold">
            <dt>Total</dt>
            <dd>${summary.total.toFixed(2)}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Pick your dates to see the total — you won&apos;t be charged yet.
        </p>
      )}

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock size={12} aria-hidden="true" />
        Your payment is protected
      </p>
    </div>
  );
}
