import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MobileTabBar } from '@/components/MobileTabBar';

// Stub everything that talks to Supabase; this test is about which
// destinations the bar offers, not how the badges are fetched.
vi.mock('@/lib/supabase/client', () => ({ getSupabaseBrowserClient: () => ({}) }));
vi.mock('@tanstack/react-query', () => ({ useQueryClient: () => ({ invalidateQueries: vi.fn() }) }));

const counts = vi.hoisted(() => ({ pending: 0, unread: 0 }));
vi.mock('@toolshare/supabase', () => ({
  usePendingRequestCount: () => ({ data: counts.pending }),
  useUnreadMessageCount: () => ({ data: counts.unread }),
  createBookingRepository: () => ({ subscribeToOwnerBookings: () => () => {} }),
  createMessageRepository: () => ({ subscribeToInbox: () => () => {} }),
  bookingKeys: { pendingCount: (id: string) => ['b', id] },
  messageKeys: { unreadCount: (id: string) => ['m', id] },
}));

const mockUser = vi.hoisted(() => ({ current: null as { id: string } | null }));
vi.mock('@/hooks/useSessionUser', () => ({ useSessionUser: () => mockUser.current }));

const pathname = vi.hoisted(() => ({ current: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => pathname.current }));

const hrefs = () =>
  screen.getAllByRole('link').map((el) => el.getAttribute('href'));

beforeEach(() => {
  counts.pending = 0;
  counts.unread = 0;
  pathname.current = '/';
});

describe('MobileTabBar', () => {
  // TKT-00005: on a phone the header rendered only Messages and the avatar —
  // Bookings, Lend a Tool and Browse were unreachable, with no hamburger or
  // drawer anywhere. These are the destinations the ticket asked for.
  it('gives a signed-in phone user every primary destination', () => {
    mockUser.current = { id: 'u1' };
    render(<MobileTabBar />);

    expect(hrefs()).toEqual(['/', '/search', '/add-tool', '/bookings', '/messages']);
    expect(screen.getByRole('link', { name: /lend/i })).toHaveAttribute('href', '/add-tool');
    expect(screen.getByRole('link', { name: /bookings/i })).toHaveAttribute('href', '/bookings');
  });

  // TKT-00005: signed-out visitors get a way in rather than owner-only tabs.
  it('offers sign-in rather than owner destinations when signed out', () => {
    mockUser.current = null;
    render(<MobileTabBar />);

    expect(hrefs()).toEqual(['/', '/search', '/how-it-works', '/login']);
    expect(screen.queryByRole('link', { name: /bookings/i })).not.toBeInTheDocument();
  });

  // TKT-00005: the bar carries the same live badges the desktop header does,
  // otherwise a phone user loses the "someone wants to borrow this" signal.
  it('shows pending request and unread message badges', () => {
    mockUser.current = { id: 'u1' };
    counts.pending = 2;
    counts.unread = 12;
    render(<MobileTabBar />);

    expect(screen.getByText('2')).toBeInTheDocument();
    // Anything past nine collapses so the badge keeps its size.
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('marks the current section, matching nested routes too', () => {
    mockUser.current = { id: 'u1' };
    pathname.current = '/bookings/abc-123';
    render(<MobileTabBar />);

    expect(screen.getByRole('link', { name: /bookings/i })).toHaveAttribute('aria-current', 'page');
    // "/" must not match everything, or every tab looks active.
    expect(screen.getByRole('link', { name: /home/i })).not.toHaveAttribute('aria-current');
  });
});
