'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useUnreadMessageCount,
  createMessageRepository,
  messageKeys,
} from '@toolshare/supabase';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';

/**
 * Header messages link with a live unread badge. Subscribes to the user's
 * inbox (all message inserts they're allowed to see) and refetches the count
 * the instant a message arrives — so "new message" shows without a refresh,
 * which was the reported gap.
 */
export function MessagesNotifier() {
  const supabase = getSupabaseBrowserClient();
  const qc = useQueryClient();
  const user = useSessionUser();
  const { data: count = 0 } = useUnreadMessageCount(supabase, user?.id);

  useEffect(() => {
    if (!user) return;
    const repo = createMessageRepository(supabase);
    return repo.subscribeToInbox(user.id, (msg) => {
      if (msg.sender_id === user.id) return; // my own send doesn't notify me
      void qc.invalidateQueries({ queryKey: messageKeys.unreadCount(user.id) });
      void qc.invalidateQueries({ queryKey: messageKeys.conversations(user.id) });
    });
  }, [supabase, qc, user]);

  return (
    <Link
      href="/messages"
      aria-label={count > 0 ? `Messages, ${count} unread` : 'Messages'}
      className="relative flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-muted hover:text-primary"
    >
      <MessageSquare size={18} aria-hidden="true" />
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
          {count > 9 ? '9+' : count}
        </span>
      ) : null}
    </Link>
  );
}
