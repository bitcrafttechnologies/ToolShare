'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useConversations,
  createMessageRepository,
  messageKeys,
  type Conversation,
} from '@toolshare/supabase';
import { Components } from '@toolshare/ui';
import { cn } from '@toolshare/lib';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';

const { Avatar, EmptyState, Spinner } = Components;

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ConversationsView() {
  const supabase = getSupabaseBrowserClient();
  const qc = useQueryClient();
  const user = useSessionUser();
  const { data: conversations, isLoading } = useConversations(supabase, user?.id);

  // Keep the inbox live too — a new message reorders/updates rows immediately.
  useEffect(() => {
    if (!user) return;
    const repo = createMessageRepository(supabase);
    return repo.subscribeToInbox(user.id, () => {
      void qc.invalidateQueries({ queryKey: messageKeys.conversations(user.id) });
    });
  }, [supabase, qc, user]);

  if (!user) {
    return (
      <EmptyState
        className="mt-8"
        title="Sign in to see your messages"
        description="Messages are tied to your bookings."
        action={
          <Link
            href="/login?next=/messages"
            className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
          >
            Sign in
          </Link>
        }
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
        <span className="sr-only">Loading messages…</span>
      </div>
    );
  }

  if (!conversations?.length) {
    return (
      <EmptyState
        className="mt-8"
        title="No messages yet"
        description="Once you book a tool or approve a request, you can message the other person here."
        action={
          <Link
            href="/bookings"
            className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
          >
            View bookings
          </Link>
        }
      />
    );
  }

  return (
    <ul className="mt-8 flex list-none flex-col gap-2 pl-0">
      {conversations.map((c) => (
        <ConversationRow key={c.booking.id} conversation={c} userId={user.id} />
      ))}
    </ul>
  );
}

function ConversationRow({ conversation, userId }: { conversation: Conversation; userId: string }) {
  const { booking, lastMessage, unreadCount } = conversation;
  const counterparty = userId === booking.owner_id ? booking.renter : booking.owner;
  const photo = booking.tool?.photo_urls?.[0];
  const sentByMe = lastMessage.sender_id === userId;

  return (
    <li>
      <Link
        href={`/bookings/${booking.id}/chat`}
        className="flex items-center gap-3 rounded-md border border-border bg-surface p-3 transition-colors hover:border-primary-400"
      >
        <div className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-surface-muted">
          {photo ? (
            <Image src={photo} alt="" fill className="object-cover" sizes="48px" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImageOff size={16} aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="flex items-center gap-1.5 truncate font-medium">
              <Avatar
                src={counterparty?.avatar_url ?? undefined}
                name={counterparty?.display_name ?? 'User'}
                size="sm"
                className="size-5 text-[10px]"
              />
              {counterparty?.display_name ?? 'User'}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {timeAgo(lastMessage.created_at)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            <span className="text-muted-foreground/70">{booking.tool?.title ?? 'Tool'} · </span>
            {sentByMe ? 'You: ' : ''}
            {lastMessage.content}
          </p>
        </div>

        {unreadCount > 0 ? (
          <span
            className={cn(
              'flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground',
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </Link>
    </li>
  );
}
