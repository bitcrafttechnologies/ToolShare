export interface Category {
  id: number;
  name: string;
  slug: string;
  icon_name?: string | null;
  sort_order: number;
}

export interface ProjectType {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  category_ids: number[];
}

export interface BlockedDate {
  id: string;
  tool_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  booking_id?: string | null;
}
