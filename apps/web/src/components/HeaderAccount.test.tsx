import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeaderAccount } from '@/components/HeaderAccount';

// Stub everything that talks to Supabase; this test is about which links the
// account corner renders, and in what order.
vi.mock('@/lib/supabase/client', () => ({ getSupabaseBrowserClient: () => ({}) }));
vi.mock('@toolshare/supabase', () => ({ useProfile: () => ({ data: null }) }));
vi.mock('@/components/MessagesNotifier', () => ({
  MessagesNotifier: () => <a href="/messages">Messages</a>,
}));
vi.mock('@/components/BookingsNotifier', () => ({
  BookingsNotifier: () => <a href="/bookings">Bookings</a>,
}));

const mockUser = vi.hoisted(() => ({ current: null as { id: string } | null }));
vi.mock('@/hooks/useSessionUser', () => ({ useSessionUser: () => mockUser.current }));

describe('HeaderAccount', () => {
  it('offers signed-in testers a bug report link between favourites and bookings', () => {
    mockUser.current = { id: 'u1' };
    render(<HeaderAccount />);

    const bug = screen.getByRole('link', { name: 'Report a bug' });
    expect(bug).toHaveAttribute('href', '/bug-report');

    const order = screen
      .getAllByRole('link')
      .map((el) => el.getAttribute('href'));
    expect(order.indexOf('/bug-report')).toBeGreaterThan(order.indexOf('/favorites'));
    expect(order.indexOf('/bug-report')).toBeLessThan(order.indexOf('/bookings'));
  });

  it('hides the bug report link from signed-out visitors', () => {
    mockUser.current = null;
    render(<HeaderAccount />);

    expect(screen.queryByRole('link', { name: 'Report a bug' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
  });

  // TKT-00005: the bug report link is the one header action with no mobile
  // counterpart in <MobileTabBar>, so it must not be gated behind a
  // breakpoint. It used to be `hidden sm:flex`, which put it out of reach for
  // exactly the phone testers meant to file bugs. The existing tests above
  // assert ordering only, which is why that was invisible to the suite.
  it('keeps the bug report link reachable at phone widths', () => {
    mockUser.current = { id: 'u1' };
    render(<HeaderAccount />);

    expect(screen.getByRole('link', { name: 'Report a bug' }).className).not.toMatch(/\bhidden\b/);
  });

  // TKT-00005: everything the tab bar also carries has to be hidden below
  // `md`, or those destinations render twice on a phone.
  it('defers its duplicated destinations to the tab bar below md', () => {
    mockUser.current = { id: 'u1' };
    render(<HeaderAccount />);

    const favorites = screen.getByRole('link', { name: 'Saved tools' });
    expect(favorites.className).toMatch(/\bhidden\b/);
    expect(favorites.className).toMatch(/\bmd:flex\b/);

    // Messages and Bookings are wrapped rather than styled directly.
    expect(screen.getByRole('link', { name: 'Messages' }).closest('div')?.className).toMatch(
      /\bhidden\b.*\bmd:block\b/,
    );
    expect(screen.getByRole('link', { name: 'Bookings' }).closest('div')?.className).toMatch(
      /\bhidden\b.*\bmd:block\b/,
    );
  });
});
