export interface Profile {
  id: string;
  display_name: string;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  owner_rating: number;
  renter_rating: number;
  review_count_owner: number;
  review_count_renter: number;
  is_identity_verified: boolean;
  is_age_verified: boolean;
  stripe_customer_id?: string | null;
  address_display?: string | null;
  expo_push_token?: string | null;
  created_at?: string | null;
}
