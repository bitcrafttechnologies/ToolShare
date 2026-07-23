import { describe, it, expect } from 'vitest';
import { checkToolAvailability, getBlockedDateSet } from '../src/checkToolAvailability';
import type { BlockedDate } from '@toolshare/types';

const blocked = (start: string, end: string): BlockedDate => ({
  id: 'b1',
  tool_id: 't1',
  start_date: start,
  end_date: end,
  reason: 'owner_block',
});

const d = (s: string) => new Date(s);

describe('checkToolAvailability', () => {
  it('returns available when no blocked dates', () => {
    const r = checkToolAvailability([], d('2025-06-10'), d('2025-06-12'));
    expect(r.isAvailable).toBe(true);
    expect(r.conflictingRanges).toHaveLength(0);
  });

  it('detects overlap: requested range inside blocked range', () => {
    const r = checkToolAvailability(
      [blocked('2025-06-08', '2025-06-15')],
      d('2025-06-10'),
      d('2025-06-12'),
    );
    expect(r.isAvailable).toBe(false);
    expect(r.conflictingRanges).toHaveLength(1);
  });

  it('detects overlap: blocked range inside requested range', () => {
    const r = checkToolAvailability(
      [blocked('2025-06-11', '2025-06-11')],
      d('2025-06-10'),
      d('2025-06-12'),
    );
    expect(r.isAvailable).toBe(false);
  });

  it('adjacent ranges do not conflict', () => {
    const r = checkToolAvailability(
      [blocked('2025-06-01', '2025-06-09')],
      d('2025-06-10'),
      d('2025-06-12'),
    );
    expect(r.isAvailable).toBe(true);
  });

  it('touching end boundary is a conflict', () => {
    const r = checkToolAvailability(
      [blocked('2025-06-12', '2025-06-14')],
      d('2025-06-10'),
      d('2025-06-12'),
    );
    expect(r.isAvailable).toBe(false);
  });
});

describe('getBlockedDateSet', () => {
  it('returns all dates in range as ISO strings', () => {
    const set = getBlockedDateSet([blocked('2025-06-10', '2025-06-12')]);
    expect(set.has('2025-06-10')).toBe(true);
    expect(set.has('2025-06-11')).toBe(true);
    expect(set.has('2025-06-12')).toBe(true);
    expect(set.size).toBe(3);
  });
});
