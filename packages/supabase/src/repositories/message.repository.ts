import type { SupabaseClient } from '@supabase/supabase-js';
import type { Booking, Message } from '@toolshare/types';

const MESSAGE_SELECT =
  '*, sender:profiles!messages_sender_id_fkey(id, display_name, avatar_url)';

// Owner/renter joins named explicitly — going messages→bookings→profiles is
// otherwise ambiguous (same PGRST201 trap as favorites).
const CONVERSATION_BOOKING_SELECT =
  'id, tool_id, renter_id, owner_id, booking_status, tool:tools(id, title, photo_urls), ' +
  'renter:profiles!bookings_renter_id_fkey(id, display_name, avatar_url), ' +
  'owner:profiles!bookings_owner_id_fkey(id, display_name, avatar_url)';

export interface Conversation {
  booking: Booking;
  lastMessage: Pick<Message, 'content' | 'created_at' | 'sender_id'>;
  unreadCount: number;
}

export function createMessageRepository(supabase: SupabaseClient) {
  return {
    async getMessages(bookingId: string): Promise<Message[]> {
      const { data, error } = await supabase
        .from('messages')
        .select(MESSAGE_SELECT)
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Message[];
    },

    subscribeToMessages(bookingId: string, onMessage: (msg: Message) => void): () => void {
      // Unique per call — see subscribeToInbox. Guards against a same-named
      // channel lingering across a StrictMode mount/unmount/mount in dev.
      const channel = supabase
        .channel(`messages:${bookingId}:${Math.random().toString(36).slice(2)}`)
        .on<Message>(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `booking_id=eq.${bookingId}`,
          },
          (payload) => onMessage(payload.new as Message),
        )
        .subscribe();

      return () => {
        void supabase.removeChannel(channel);
      };
    },

    async sendMessage(bookingId: string, senderId: string, content: string): Promise<Message> {
      const { data, error } = await supabase
        .from('messages')
        .insert({ booking_id: bookingId, sender_id: senderId, content })
        .select(MESSAGE_SELECT)
        .single();
      if (error) throw error;
      return data as Message;
    },

    async markAsRead(bookingId: string, userId: string): Promise<void> {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('booking_id', bookingId)
        .neq('sender_id', userId)
        .eq('is_read', false);
      if (error) throw error;
    },

    /**
     * Count of unread messages addressed to this user. RLS already limits the
     * messages table to the user's own bookings, so "unread and not sent by
     * me" is exactly their unread inbox — no join needed here.
     */
    async getUnreadCount(userId: string): Promise<number> {
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', userId);
      if (error) throw error;
      return count ?? 0;
    },

    /** One row per booking that has any messages: last message + unread count. */
    async listConversations(userId: string): Promise<Conversation[]> {
      const { data: msgs, error } = await supabase
        .from('messages')
        .select('booking_id, content, created_at, sender_id, is_read')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const byBooking = new Map<
        string,
        { last: Pick<Message, 'content' | 'created_at' | 'sender_id'>; unread: number }
      >();
      for (const m of (msgs ?? []) as Array<{
        booking_id: string;
        content: string;
        created_at: string | null;
        sender_id: string;
        is_read: boolean;
      }>) {
        let entry = byBooking.get(m.booking_id);
        if (!entry) {
          // messages come newest-first, so the first seen per booking is latest
          entry = { last: { content: m.content, created_at: m.created_at, sender_id: m.sender_id }, unread: 0 };
          byBooking.set(m.booking_id, entry);
        }
        if (!m.is_read && m.sender_id !== userId) entry.unread += 1;
      }

      const ids = [...byBooking.keys()];
      if (ids.length === 0) return [];

      const { data: bookings, error: bErr } = await supabase
        .from('bookings')
        .select(CONVERSATION_BOOKING_SELECT)
        .in('id', ids);
      if (bErr) throw bErr;

      const bookingById = new Map((bookings as unknown as Booking[]).map((b) => [b.id, b]));
      return ids.flatMap((id) => {
        const booking = bookingById.get(id);
        const entry = byBooking.get(id)!;
        return booking ? [{ booking, lastMessage: entry.last, unreadCount: entry.unread }] : [];
      });
    },

    /**
     * Fires on every message insert the user is allowed to see (RLS scopes it
     * to their bookings), across all conversations — for the header unread
     * badge and inbox. Distinct from subscribeToMessages, which is one thread.
     */
    subscribeToInbox(userId: string, onMessage: (msg: Message) => void): () => void {
      // Unique channel name per subscription. Two components (header badge +
      // inbox list) subscribe at once; `supabase.channel(name)` returns the
      // SAME instance for a repeated name, and adding `.on()` after that
      // instance is already subscribed throws and crashes the render.
      const channel = supabase
        .channel(`inbox:${userId}:${Math.random().toString(36).slice(2)}`)
        .on<Message>(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => onMessage(payload.new as Message),
        )
        .subscribe();
      return () => {
        void supabase.removeChannel(channel);
      };
    },
  };
}

export type MessageRepository = ReturnType<typeof createMessageRepository>;
