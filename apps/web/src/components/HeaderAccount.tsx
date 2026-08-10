'use client';

import Link from 'next/link';
import { Heart, Bug } from 'lucide-react';
import { useProfile } from '@toolshare/supabase';
import { Components } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';
import { MessagesNotifier } from '@/components/MessagesNotifier';
import { BookingsNotifier } from '@/components/BookingsNotifier';

const { Avatar, Button } = Components;

/**
 * Account corner of the site header.
 *
 * Deliberately a Client Component: reading the session on the server would
 * call `cookies()`, which opts the whole route out of static rendering —
 * and /tools/[id] is statically generated with ISR for SEO. Keeping auth
 * in a client island lets those pages stay static while the header still
 * reflects who's signed in.
 */
export function HeaderAccount() {
  const supabase = getSupabaseBrowserClient();
  const user = useSessionUser();
  // useProfile guards itself with `enabled: !!userId`, so '' is its
  // documented "no user yet" input rather than a value it will query on.
  const { data: profile } = useProfile(supabase, user?.id ?? '');

  // Reserve the slot while the session resolves so the header doesn't
  // visibly reflow between signed-out and signed-in states.
  if (user === null) {
    return (
      <div className="flex items-center gap-2">
        {/* `md`, not `sm`: below that the tab bar carries Sign in, and at `sm`
            the two overlapped. "Get started" stays visible at every width —
            it's the primary call to action. */}
        <Link href="/login" className="hidden md:block">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm">Get started</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {/* Below `md` these three live in <MobileTabBar> instead, so each
          destination is reachable from exactly one place at any width
          (TKT-00005). The breakpoint has to match SiteHeader's nav and the tab
          bar's `md:hidden` — at `sm` they overlapped and rendered twice. */}
      <div className="hidden md:block">
        <MessagesNotifier />
      </div>
      <Link
        href="/favorites"
        aria-label="Saved tools"
        className="hidden size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-muted hover:text-primary md:flex"
      >
        <Heart size={18} aria-hidden="true" />
      </Link>
      {/* Pilot-only: signed-in testers file bugs from here. Deliberately has no
          responsive gate — it is not in the tab bar, and testers on phones are
          exactly who needs to file bugs. */}
      <Link
        href="/bug-report"
        aria-label="Report a bug"
        title="Report a bug"
        className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-muted hover:text-primary"
      >
        <Bug size={18} aria-hidden="true" />
      </Link>
      <div className="hidden md:block">
        <BookingsNotifier />
      </div>
      <Link
        href="/profile"
        className="flex items-center rounded-full p-0.5 transition-opacity hover:opacity-80"
        aria-label="Your profile"
      >
        <Avatar
          src={profile?.avatar_url ?? undefined}
          name={profile?.display_name ?? 'You'}
          verified={profile?.is_identity_verified}
          size="sm"
        />
      </Link>
    </div>
  );
}
