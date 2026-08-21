import { useQuery } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createMessageRepository } from '../repositories/message.repository';
import { messageKeys } from '../queryKeys';

/** Total unread messages addressed to the user (for the header badge). */
export function useUnreadMessageCount(supabase: SupabaseClient, userId: string | undefined) {
  const repo = createMessageRepository(supabase);
  return useQuery({
    queryKey: messageKeys.unreadCount(userId ?? ''),
    queryFn: () => repo.getUnreadCount(),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

/** Inbox: one row per booking that has messages, newest activity first. */
export function useConversations(supabase: SupabaseClient, userId: string | undefined) {
  const repo = createMessageRepository(supabase);
  return useQuery({
    queryKey: messageKeys.conversations(userId ?? ''),
    queryFn: () => repo.listConversations(userId!),
    enabled: !!userId,
  });
}
