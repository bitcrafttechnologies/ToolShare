import type { Profile } from './profile';

export type ReviewType = 'tool' | 'owner' | 'renter';

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id?: string | null;
  tool_id?: string | null;
  review_type: ReviewType;
  rating: number;
  comment?: string | null;
  is_flagged: boolean;
  created_at?: string | null;
  reviewer?: Profile | null;
}

export interface CreateReviewRequest {
  booking_id: string;
  reviewer_id: string;
  reviewee_id?: string;
  tool_id?: string;
  review_type: ReviewType;
  rating: number;
  comment?: string;
}
