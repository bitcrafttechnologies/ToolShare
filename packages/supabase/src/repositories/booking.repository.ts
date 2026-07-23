import type { SupabaseClient } from '@supabase/supabase-js';
import type { Booking, BookingStatus, CreateBookingRequest, ReturnCondition } from '@toolshare/types';

const BOOKING_SELECT =
  '*, tool:tools(id, title, photo_urls, daily_rate, deposit_amount, owner_id, address_display, pickup_available, delivery_available, delivery_radius_miles), renter:profiles!bookings_renter_id_fkey(id, display_name, avatar_url), owner:profiles!bookings_owner_id_fkey(id, display_name, avatar_url)';

export function createBookingRepository(supabase: SupabaseClient) {
  return {
    async getBookingsForRenter(renterId: string): Promise<Booking[]> {
      const { data, error } = await supabase
        .from('bookings')
        .select(BOOKING_SELECT)
        .eq('renter_id', renterId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Booking[];
    },

    async getBookingsForOwner(ownerId: string): Promise<Booking[]> {
      const { data, error } = await supabase
        .from('bookings')
        .select(BOOKING_SELECT)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Booking[];
    },

    async getBookingById(id: string): Promise<Booking | null> {
      const { data, error } = await supabase
        .from('bookings')
        .select(BOOKING_SELECT)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Booking;
    },

    async createBooking(request: CreateBookingRequest): Promise<Booking> {
      const { data, error } = await supabase
        .from('bookings')
        .insert(request)
        .select(BOOKING_SELECT)
        .single();
      if (error) throw error;
      return data as Booking;
    },

    async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
      const { data, error } = await supabase
        .from('bookings')
        .update({ booking_status: status })
        .eq('id', id)
        .select(BOOKING_SELECT)
        .single();
      if (error) throw error;
      return data as Booking;
    },

    async signWaiver(id: string, contentHash: string): Promise<void> {
      const { error } = await supabase
        .from('bookings')
        .update({
          waiver_signed_at: new Date().toISOString(),
          waiver_content_hash: contentHash,
        })
        .eq('id', id);
      if (error) throw error;
    },

    /** Count of pending requests on the owner's tools — the lender's inbox badge. */
    async getPendingRequestCount(ownerId: string): Promise<number> {
      const { count, error } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', ownerId)
        .eq('booking_status', 'pending');
      if (error) throw error;
      return count ?? 0;
    },

    /**
     * Fires on any change to a booking where the user is the owner — new
     * request, cancellation, return. RLS scopes the stream to their bookings;
     * `owner_id` filter narrows to the lender side. Unique channel name (see
     * the message repo note) so multiple subscribers don't collide.
     */
    subscribeToOwnerBookings(ownerId: string, onChange: () => void): () => void {
      const channel = supabase
        .channel(`owner-bookings:${ownerId}:${Math.random().toString(36).slice(2)}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings', filter: `owner_id=eq.${ownerId}` },
          () => onChange(),
        )
        .subscribe();
      return () => {
        void supabase.removeChannel(channel);
      };
    },

    /** Renter signals the tool has been returned; awaits owner confirmation. */
    async requestReturn(id: string): Promise<Booking> {
      const { data, error } = await supabase
        .from('bookings')
        .update({ return_requested_at: new Date().toISOString() })
        .eq('id', id)
        .select(BOOKING_SELECT)
        .single();
      if (error) throw error;
      return data as Booking;
    },

    /** Owner confirms receipt, records condition + photos, completes the booking. */
    async confirmReturn(
      id: string,
      details: { condition: ReturnCondition; notes?: string | undefined; photoUrls?: string[] | undefined },
    ): Promise<Booking> {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          booking_status: 'completed',
          return_condition: details.condition,
          return_notes: details.notes ?? null,
          return_photo_urls: details.photoUrls ?? [],
        })
        .eq('id', id)
        .select(BOOKING_SELECT)
        .single();
      if (error) throw error;
      return data as Booking;
    },
  };
}

export type BookingRepository = ReturnType<typeof createBookingRepository>;
