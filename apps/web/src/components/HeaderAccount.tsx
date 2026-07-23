'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
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
        <Link href="/login" className="hidden sm:block">
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
      <MessagesNotifier />
      <Link
        href="/favorites"
        aria-label="Saved tools"
        className="hidden size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-muted hover:text-primary sm:flex"
      >
        <Heart size={18} aria-hidden="true" />
      </Link>
      <div className="hidden sm:block">
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
