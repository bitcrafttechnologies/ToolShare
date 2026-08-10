'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, ClipboardList, MessageSquare, LogIn, HelpCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  usePendingRequestCount,
  useUnreadMessageCount,
  createBookingRepository,
  createMessageRepository,
  bookingKeys,
  messageKeys,
} from '@toolshare/supabase';
import { Navigation } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';

const { TabBar, TabBarItem } = Navigation;

/**
 * Bottom navigation for phones (TKT-00005).
 *
 * The header hides its nav below `md`, which left a signed-in phone user with
 * exactly two destinations — messages and their avatar — and no way at all to
 * reach Bookings, Lend a Tool or the bug report. There was no hamburger or
 * drawer anywhere in the app.
 *
 * Everything here is duplicated in the header above `md` and hidden there, so
 * a destination appears exactly once at any width. Mirrors the Expo app's tab
 * bar so the two platforms navigate the same way.
 *
 * Client Component by necessity (session + live badges); rendering it from the
 * root layout does not opt any route out of static rendering, same as
 * <HeaderAccount>.
 */
export function MobileTabBar() {
  const supabase = getSupabaseBrowserClient();
  const pathname = usePathname();
  const user = useSessionUser();
  const qc = useQueryClient();

  const { data: pendingCount = 0 } = usePendingRequestCount(supabase, user?.id);
  const { data: unreadCount = 0 } = useUnreadMessageCount(supabase, user?.id);

  // Same live subscriptions the header notifiers use, so a badge down here
  // updates without a refresh too.
  useEffect(() => {
    if (!user) return;
    const bookings = createBookingRepository(supabase);
    return bookings.subscribeToOwnerBookings(user.id, () => {
      void qc.invalidateQueries({ queryKey: bookingKeys.pendingCount(user.id) });
    });
  }, [supabase, qc, user]);

  useEffect(() => {
    if (!user) return;
    const messages = createMessageRepository(supabase);
    return messages.subscribeToInbox(user.id, (msg) => {
      if (msg.sender_id === user.id) return;
      void qc.invalidateQueries({ queryKey: messageKeys.unreadCount(user.id) });
    });
  }, [supabase, qc, user]);

  const items = user
    ? [
        { href: '/', label: 'Home', icon: <Home /> },
        { href: '/search', label: 'Browse', icon: <Search /> },
        { href: '/add-tool', label: 'Lend', icon: <PlusCircle /> },
        { href: '/bookings', label: 'Bookings', icon: <ClipboardList />, count: pendingCount },
        { href: '/messages', label: 'Messages', icon: <MessageSquare />, count: unreadCount },
      ]
    : [
        { href: '/', label: 'Home', icon: <Home /> },
        { href: '/search', label: 'Browse', icon: <Search /> },
        { href: '/how-it-works', label: 'How it works', icon: <HelpCircle /> },
        { href: '/login', label: 'Sign in', icon: <LogIn /> },
      ];

  return (
    <TabBar aria-label="Main" className="md:hidden">
      {items.map((item) => (
        <TabBarItem
          key={item.href}
          as={Link}
          href={item.href}
          icon={item.icon}
          label={item.label}
          // Exact match for "/", prefix match elsewhere, so /bookings/123 still
          // highlights Bookings.
          active={item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)}
          badge={
            item.count ? (
              <span
                aria-label={`${item.count} unread`}
                className="flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground"
              >
                {item.count > 9 ? '9+' : item.count}
              </span>
            ) : undefined
          }
        />
      ))}
    </TabBar>
  );
}
