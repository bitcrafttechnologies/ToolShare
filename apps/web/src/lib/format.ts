/**
 * Shared display formatting.
 *
 * Date columns (`start_date`, `end_date`) are Postgres `date`, i.e. plain
 * "YYYY-MM-DD" with no zone. `new Date("2026-07-20")` parses that as
 * midnight *UTC*, which renders as the previous day for anyone west of
 * Greenwich — including every user of a Phoenix-metro app. Appending a
 * time forces local-midnight parsing instead.
 */
export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function formatDate(
  value: string,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' },
): string {
  return parseDateOnly(value).toLocaleDateString('en-US', options);
}

/** "Jul 20 – 24, 2026", collapsing the shared month/year where possible. */
export function formatDateRange(start: string, end: string): string {
  const s = parseDateOnly(start);
  const e = parseDateOnly(end);

  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();

  // Single-day rentals are legitimate (start === end), and a range
  // formatter renders them as the nonsense "Jul 20 – 20, 2026".
  if (start === end) return formatDate(start);

  if (sameMonth) {
    const month = s.toLocaleDateString('en-US', { month: 'short' });
    return `${month} ${s.getDate()} – ${e.getDate()}, ${e.getFullYear()}`;
  }
  if (sameYear) {
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${e.getFullYear()}`;
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
}

/** Day count inclusive of both endpoints, matching calculateBookingPrice. */
export function countDays(start: string, end: string): number {
  const ms = parseDateOnly(end).getTime() - parseDateOnly(start).getTime();
  return Math.round(ms / 86_400_000) + 1;
}
