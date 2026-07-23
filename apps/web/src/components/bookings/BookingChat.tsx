'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { SendHorizontal } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { createMessageRepository, messageKeys, useBooking } from '@toolshare/supabase';
import type { Message } from '@toolshare/types';
import { Components } from '@toolshare/ui';
import { cn } from '@toolshare/lib';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';

const { Avatar, Button, Spinner, Textarea, Alert } = Components;

interface Props {
  bookingId: string;
}

export function BookingChat({ bookingId }: Props) {
  const supabase = getSupabaseBrowserClient();
  const qc = useQueryClient();
  const user = useSessionUser();
  const { data: booking } = useBooking(supabase, bookingId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const repo = useMemo(() => createMessageRepository(supabase), [supabase]);
  const bottomRef = useRef<HTMLDivElement>(null);

  /**
   * Insert keeping the list unique by id.
   *
   * The realtime subscription fires for *every* insert on this booking,
   * including our own — appending blindly on send AND on the echo shows
   * the sender their own message twice.
   */
  const upsertMessage = useCallback((incoming: Message) => {
    setMessages((prev) =>
      prev.some((m) => m.id === incoming.id)
        ? prev.map((m) => (m.id === incoming.id ? { ...m, ...incoming } : m))
        : [...prev, incoming],
    );
  }, []);

  useEffect(() => {
    let active = true;

    repo
      .getMessages(bookingId)
      .then((msgs) => {
        if (!active) return;
        setMessages(msgs);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Could not load messages');
        setLoading(false);
      });

    const unsubscribe = repo.subscribeToMessages(bookingId, upsertMessage);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [bookingId, repo, upsertMessage]);

  // Clear the unread flag on the other party's messages once they're on
  // screen, and refresh the header badge / inbox. Re-runs as new messages
  // arrive while the thread is open (messages.length dependency), so an
  // incoming message here never leaves a stale unread count elsewhere.
  useEffect(() => {
    if (!user || loading) return;
    void repo
      .markAsRead(bookingId, user.id)
      .then(() => {
        void qc.invalidateQueries({ queryKey: messageKeys.unreadCount(user.id) });
        void qc.invalidateQueries({ queryKey: messageKeys.conversations(user.id) });
      })
      .catch(() => {
        // Non-critical: the thread is readable whether or not this lands.
      });
  }, [bookingId, repo, user, loading, qc, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function send() {
    const content = text.trim();
    if (!content || !user || sending) return;
    setText('');
    setSending(true);
    try {
      upsertMessage(await repo.sendMessage(bookingId, user.id, content));
      setError(null);
    } catch (err) {
      setText(content); // give the draft back rather than losing it
      setError(err instanceof Error ? err.message : 'Message failed to send');
    } finally {
      setSending(false);
    }
  }

  const counterparty = user?.id === booking?.owner_id ? booking?.renter : booking?.owner;

  return (
    <>
      <div className="flex items-center gap-3 border-b border-border py-4">
        <Link
          href={`/bookings/${bookingId}`}
          className="text-sm font-medium text-primary hover:text-primary-600"
        >
          <span aria-hidden="true">←</span> Booking
        </Link>
        {counterparty ? (
          <div className="flex min-w-0 items-center gap-2">
            <Avatar
              src={counterparty.avatar_url ?? undefined}
              name={counterparty.display_name}
              size="sm"
            />
            <span className="truncate font-medium">{counterparty.display_name}</span>
          </div>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
            <span className="sr-only">Loading messages…</span>
          </div>
        ) : messages.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No messages yet — say hello and sort out pickup details.
          </p>
        ) : (
          <ul className="flex list-none flex-col gap-3 pl-0">
            {messages.map((message) => {
              const isMe = message.sender_id === user?.id;
              // Realtime INSERT payloads are the raw row with no `sender`
              // join, so fall back to the name we already know.
              const senderName =
                message.sender?.display_name ?? (isMe ? 'You' : counterparty?.display_name);

              return (
                <li
                  key={message.id}
                  className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[75%] rounded-lg px-4 py-2.5',
                      isMe
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface-muted text-foreground',
                    )}
                  >
                    {!isMe && senderName ? (
                      <p className="mb-0.5 text-xs font-medium text-muted-foreground">
                        {senderName}
                      </p>
                    ) : null}
                    <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      {error ? (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      ) : null}

      <form
        className="flex items-end gap-2 border-t border-border py-4"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <label htmlFor="message-input" className="sr-only">
          Message
        </label>
        <Textarea
          id="message-input"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="max-h-32 min-h-10 resize-none"
          onKeyDown={(e) => {
            // Enter sends; Shift+Enter makes a new line.
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <Button type="submit" disabled={!text.trim() || !user} isLoading={sending}>
          <SendHorizontal size={16} aria-hidden="true" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </>
  );
}
