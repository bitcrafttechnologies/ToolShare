import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createProfileRepository } from '../repositories/profile.repository';
import { profileKeys } from '../queryKeys';
import type { Profile } from '@toolshare/types';

export function useProfile(supabase: SupabaseClient, userId: string) {
  const repo = createProfileRepository(supabase);
  return useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: () => repo.getProfile(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useUpdateProfile(supabase: SupabaseClient, userId: string) {
  const repo = createProfileRepository(supabase);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: Partial<Profile>) => repo.updateProfile(userId, updates),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: profileKeys.detail(userId) });
    },
  });
}
