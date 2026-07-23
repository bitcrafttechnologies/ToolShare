import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { BlockedDate } from '@toolshare/types';
import { useBlockedDates } from '@toolshare/supabase';
import { AvailabilityPill } from '@/components/AvailabilityPill';

// Isolate the component's own logic: stub the browser client, the data hook,
// and the Badge so the test asserts *when* the pill shows, not styling.
vi.mock('@/lib/supabase/client', () => ({ getSupabaseBrowserClient: () => ({}) }));
vi.mock('@toolshare/supabase', () => ({ useBlockedDates: vi.fn() }));
vi.mock('@toolshare/ui', () => ({
  Components: { Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span> },
}));

const mockUseBlockedDates = vi.mocked(useBlockedDates);
const today = new Date().toISOString().slice(0, 10);

function block(start: string, end: string): BlockedDate {
  return { id: 'b1', tool_id: 't1', start_date: start, end_date: end, reason: 'x', booking_id: null };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asQuery = (data: BlockedDate[]) => ({ data }) as any;

describe('AvailabilityPill', () => {
  beforeEach(() => mockUseBlockedDates.mockReset());

  it('renders nothing when the tool is available and nothing blocks today', () => {
    mockUseBlockedDates.mockReturnValue(asQuery([]));
    const { container } = render(<AvailabilityPill toolId="t1" isAvailable />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the pill when a blackout covers today', () => {
    mockUseBlockedDates.mockReturnValue(asQuery([block(today, today)]));
    render(<AvailabilityPill toolId="t1" isAvailable />);
    expect(screen.getByText('Unavailable right now')).toBeInTheDocument();
  });

  it('shows the pill when the owner has flagged the tool unavailable', () => {
    mockUseBlockedDates.mockReturnValue(asQuery([]));
    render(<AvailabilityPill toolId="t1" isAvailable={false} />);
    expect(screen.getByText('Unavailable right now')).toBeInTheDocument();
  });

  it('ignores a blackout that does not cover today', () => {
    mockUseBlockedDates.mockReturnValue(asQuery([block('2000-01-01', '2000-01-02')]));
    const { container } = render(<AvailabilityPill toolId="t1" isAvailable />);
    expect(container).toBeEmptyDOMElement();
  });
});
