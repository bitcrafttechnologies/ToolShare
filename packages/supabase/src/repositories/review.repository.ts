import type { SupabaseClient } from '@supabase/supabase-js';
import type { Review, CreateReviewRequest, ReviewType } from '@toolshare/types';

const REVIEW_SELECT =
  '*, reviewer:profiles!reviews_reviewer_id_fkey(id, display_name, avatar_url)';

export function createReviewRepository(supabase: SupabaseClient) {
  return {
    async getReviewsForTool(toolId: string): Promise<Review[]> {
      const { data, error } = await supabase
        .from('reviews')
        .select(REVIEW_SELECT)
        .eq('tool_id', toolId)
        .eq('review_type', 'tool')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Review[];
    },

    async getReviewsForUser(userId: string): Promise<Review[]> {
      const { data, error } = await supabase
        .from('reviews')
        .select(REVIEW_SELECT)
        .eq('reviewee_id', userId)
        .neq('review_type', 'tool')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Review[];
    },

    async createReview(request: CreateReviewRequest): Promise<Review> {
      const { data, error } = await supabase
        .from('reviews')
        .insert(request)
        .select(REVIEW_SELECT)
        .single();
      if (error) throw error;
      return data as Review;
    },

    async hasReviewed(bookingId: string, reviewerId: string, type: ReviewType): Promise<boolean> {
      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', bookingId)
        .eq('reviewer_id', reviewerId)
        .eq('review_type', type)
        .limit(1);
      if (error) throw error;
      return (data?.length ?? 0) > 0;
    },
  };
}

export type ReviewRepository = ReturnType<typeof createReviewRepository>;
