import type { BlockedDate } from '@toolshare/types';

export interface AvailabilityResult {
  isAvailable: boolean;
  conflictingRanges: BlockedDate[];
}

export function checkToolAvailability(
  blockedDates: BlockedDate[],
  startDate: Date,
  endDate: Date,
): AvailabilityResult {
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  const conflictingRanges = blockedDates.filter((blocked) => {
    const blockedStart = new Date(blocked.start_date).getTime();
    const blockedEnd = new Date(blocked.end_date).getTime();
    return startMs <= blockedEnd && endMs >= blockedStart;
  });

  return {
    isAvailable: conflictingRanges.length === 0,
    conflictingRanges,
  };
}

export function getBlockedDateSet(blockedDates: BlockedDate[]): Set<string> {
  const dates = new Set<string>();
  for (const blocked of blockedDates) {
    const current = new Date(blocked.start_date);
    const end = new Date(blocked.end_date);
    while (current <= end) {
      dates.add(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }
  }
  return dates;
}
