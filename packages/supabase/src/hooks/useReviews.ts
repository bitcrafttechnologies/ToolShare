import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createReviewRepository } from '../repositories/review.repository';
import { reviewKeys } from '../queryKeys';
import type { CreateReviewRequest } from '@toolshare/types';

export function useReviewsForTool(supabase: SupabaseClient, toolId: string) {
  const repo = createReviewRepository(supabase);
  return useQuery({
    queryKey: reviewKeys.forTool(toolId),
    queryFn: () => repo.getReviewsForTool(toolId),
    enabled: !!toolId,
  });
}

export function useReviewsForUser(supabase: SupabaseClient, userId: string) {
  const repo = createReviewRepository(supabase);
  return useQuery({
    queryKey: reviewKeys.forUser(userId),
    queryFn: () => repo.getReviewsForUser(userId),
    enabled: !!userId,
  });
}

export function useCreateReview(supabase: SupabaseClient) {
  const repo = createReviewRepository(supabase);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateReviewRequest) => repo.createReview(request),
    onSuccess: (_data, variables) => {
      if (variables.tool_id) {
        void qc.invalidateQueries({ queryKey: reviewKeys.forTool(variables.tool_id) });
      }
      if (variables.reviewee_id) {
        void qc.invalidateQueries({ queryKey: reviewKeys.forUser(variables.reviewee_id) });
      }
    },
  });
}
