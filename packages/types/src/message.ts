import type { Profile } from './profile';

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at?: string | null;
  sender?: Profile | null;
}
