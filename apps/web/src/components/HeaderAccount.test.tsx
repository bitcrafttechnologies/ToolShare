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
});
