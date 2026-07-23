import { describe, it, expect } from 'vitest';
import { parseDateOnly, formatDate, formatDateRange, countDays } from '@/lib/format';

describe('parseDateOnly', () => {
  it('parses a date-only string as LOCAL midnight (no UTC day-shift)', () => {
    const d = parseDateOnly('2026-07-20');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6); // July (0-indexed)
    expect(d.getDate()).toBe(20);
    expect(d.getHours()).toBe(0);
  });
});

describe('formatDate', () => {
  it('formats a date-only string with the default options', () => {
    expect(formatDate('2026-07-20')).toBe('Jul 20, 2026');
  });
});

describe('formatDateRange', () => {
  it('collapses a single-day rental to one date (the "Jul 20 – 20" bug)', () => {
    expect(formatDateRange('2026-07-20', '2026-07-20')).toBe('Jul 20, 2026');
  });

  it('collapses the shared month + year within one month', () => {
    expect(formatDateRange('2026-07-20', '2026-07-24')).toBe('Jul 20 – 24, 2026');
  });

  it('keeps both months across a month boundary in the same year', () => {
    expect(formatDateRange('2026-07-30', '2026-08-02')).toBe('Jul 30 – Aug 2, 2026');
  });

  it('shows full dates across a year boundary', () => {
    expect(formatDateRange('2026-12-30', '2027-01-02')).toBe('Dec 30, 2026 – Jan 2, 2027');
  });
});

describe('countDays', () => {
  it('is inclusive of both endpoints', () => {
    expect(countDays('2026-07-20', '2026-07-20')).toBe(1);
    expect(countDays('2026-07-20', '2026-07-22')).toBe(3);
  });
});
