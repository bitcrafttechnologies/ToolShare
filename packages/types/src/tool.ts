import type { Profile } from './profile';
import type { Category } from './category';

export type ToolCondition = 'like_new' | 'good' | 'fair' | 'heavy_use';

export const TOOL_CONDITION_LABELS: Record<ToolCondition, string> = {
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  heavy_use: 'Heavy Use',
};

export interface Tool {
  id: string;
  owner_id: string;
  title: string;
  description?: string | null;
  category_id: number;
  condition: ToolCondition;
  hourly_rate?: number | null;
  daily_rate?: number | null;
  weekly_rate?: number | null;
  deposit_amount: number;
  photo_urls: string[];
  requires_license: boolean;
  license_type?: string | null;
  min_age: number;
  is_available: boolean;
  location_point?: string | null;
  address_display?: string | null;
  pickup_available: boolean;
  delivery_available: boolean;
  delivery_radius_miles: number;
  specifications: Record<string, string>;
  safety_notes?: string | null;
  view_count: number;
  rating: number;
  review_count: number;
  created_at?: string | null;
  owner?: Profile | null;
  category?: Category | null;
  /**
   * Derived, not a column: false when the tool is unavailable *right now* —
   * either the owner flag is off, or a blocked_dates range (an active rental
   * or an owner blackout) covers today. Set by the repository. `undefined`
   * means "not computed" (older queries), which the UI treats as available.
   */
  available_now?: boolean;
}

export interface ToolBundle {
  id: string;
  owner_id: string;
  title: string;
  description?: string | null;
  photo_urls: string[];
  discount_percent: number;
  is_available: boolean;
  tools: Tool[];
  owner?: Profile | null;
  created_at?: string | null;
}

export interface CreateToolInput {
  owner_id: string;
  title: string;
  description?: string;
  category_id: number;
  condition: ToolCondition;
  hourly_rate?: number;
  daily_rate?: number;
  weekly_rate?: number;
  deposit_amount: number;
  photo_urls: string[];
  requires_license?: boolean;
  license_type?: string;
  min_age?: number;
  address_display?: string;
  pickup_available?: boolean;
  delivery_available?: boolean;
  delivery_radius_miles?: number;
  specifications?: Record<string, string>;
  safety_notes?: string;
}
