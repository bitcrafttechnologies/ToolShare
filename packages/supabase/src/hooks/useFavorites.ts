import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createFavoriteRepository } from '../repositories/favorite.repository';
import { favoriteKeys } from '../queryKeys';

/**
 * Favorited tool ids as a Set for fast membership checks on cards.
 *
 * The cache deliberately holds a plain `string[]`: the mobile query cache is
 * persisted to MMKV as JSON, and a `Set` rehydrates as `{}` — every consumer
 * then crashes on `favoriteIds.has(...)`. `select` rebuilds the Set on read,
 * after deserialization, so both fresh and restored caches behave the same.
 */
export function useFavoriteToolIds(supabase: SupabaseClient, userId: string | undefined) {
  const repo = createFavoriteRepository(supabase);
  return useQuery({
    queryKey: favoriteKeys.ids(userId ?? ''),
    queryFn: () => repo.listFavoriteToolIds(userId!),
    select: (ids: string[]) => new Set(ids),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

/** Favorited tools with owner + category joined (saved-favorites screen). */
export function useFavoriteTools(supabase: SupabaseClient, userId: string | undefined) {
  const repo = createFavoriteRepository(supabase);
  return useQuery({
    queryKey: favoriteKeys.tools(userId ?? ''),
    queryFn: () => repo.listFavoriteTools(userId!),
    enabled: !!userId,
  });
}

/** Toggle a favorite with an optimistic update on the cached id list. */
export function useToggleFavorite(supabase: SupabaseClient, userId: string | undefined) {
  const repo = createFavoriteRepository(supabase);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ toolId, favorited }: { toolId: string; favorited: boolean }) => {
      if (!userId) throw new Error('Must be signed in to save favorites');
      if (favorited) {
        await repo.remove(userId, toolId);
      } else {
        await repo.add(userId, toolId);
      }
    },
    onMutate: async ({ toolId, favorited }) => {
      if (!userId) return { previous: undefined };
      const key = favoriteKeys.ids(userId);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<string[]>(key);
      if (previous) {
        qc.setQueryData<string[]>(
          key,
          favorited ? previous.filter((id) => id !== toolId) : [...previous, toolId],
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (userId && context?.previous) {
        qc.setQueryData(favoriteKeys.ids(userId), context.previous);
      }
    },
    onSettled: () => {
      if (userId) {
        void qc.invalidateQueries({ queryKey: favoriteKeys.all(userId) });
      }
    },
  });
}
