import type { Tool } from './tool';
import type { Profile } from './profile';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type PaymentMethodType = 'stripe_card' | 'cash_app' | 'in_person';

export type ReturnCondition = 'like_new' | 'good' | 'fair' | 'damaged';

export const RETURN_CONDITION_LABELS: Record<ReturnCondition, string> = {
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  damaged: 'Damaged',
};

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'refunded'
  | 'failed';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  stripe_card: 'Card',
  cash_app: 'Cash App Pay',
  in_person: 'In Person',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
};

export function isActiveBooking(status: BookingStatus): boolean {
  return status === 'confirmed' || status === 'active';
}

export interface Booking {
  id: string;
  tool_id?: string | null;
  bundle_id?: string | null;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  deposit_amount: number;
  payment_method: PaymentMethodType;
  payment_status: PaymentStatus;
  stripe_payment_intent_id?: string | null;
  booking_status: BookingStatus;
  waiver_signed_at?: string | null;
  waiver_content_hash?: string | null;
  pickup_type: string;
  notes?: string | null;
  // Return flow: renter marks returned (return_requested_at), owner confirms
  // and records the condition + optional photos, which completes the booking.
  return_requested_at?: string | null;
  return_condition?: ReturnCondition | null;
  return_notes?: string | null;
  return_photo_urls: string[];
  created_at?: string | null;
  tool?: Tool | null;
  renter?: Profile | null;
  owner?: Profile | null;
}

export interface CreateBookingRequest {
  tool_id?: string;
  bundle_id?: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  deposit_amount?: number;
  payment_method: PaymentMethodType;
  pickup_type?: string;
  notes?: string;
}
