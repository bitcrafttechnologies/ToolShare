import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createBookingRepository } from '../repositories/booking.repository';
import { bookingKeys } from '../queryKeys';
import type { Booking, CreateBookingRequest, BookingStatus, ReturnCondition } from '@toolshare/types';

function invalidateBooking(
  qc: ReturnType<typeof useQueryClient>,
  booking: Pick<Booking, 'id' | 'renter_id' | 'owner_id'>,
) {
  void qc.invalidateQueries({ queryKey: bookingKeys.detail(booking.id) });
  void qc.invalidateQueries({ queryKey: bookingKeys.forRenter(booking.renter_id) });
  void qc.invalidateQueries({ queryKey: bookingKeys.forOwner(booking.owner_id) });
}

export function useBookingsForRenter(supabase: SupabaseClient, renterId: string) {
  const repo = createBookingRepository(supabase);
  return useQuery({
    queryKey: bookingKeys.forRenter(renterId),
    queryFn: () => repo.getBookingsForRenter(renterId),
    enabled: !!renterId,
  });
}

export function useBookingsForOwner(supabase: SupabaseClient, ownerId: string) {
  const repo = createBookingRepository(supabase);
  return useQuery({
    queryKey: bookingKeys.forOwner(ownerId),
    queryFn: () => repo.getBookingsForOwner(ownerId),
    enabled: !!ownerId,
  });
}

export function useBooking(supabase: SupabaseClient, id: string) {
  const repo = createBookingRepository(supabase);
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => repo.getBookingById(id),
    enabled: !!id,
  });
}

/** Pending requests on the user's own listings — the lender notification count. */
export function usePendingRequestCount(supabase: SupabaseClient, ownerId: string | undefined) {
  const repo = createBookingRepository(supabase);
  return useQuery({
    queryKey: bookingKeys.pendingCount(ownerId ?? ''),
    queryFn: () => repo.getPendingRequestCount(ownerId!),
    enabled: !!ownerId,
    staleTime: 30_000,
  });
}

export function useCreateBooking(supabase: SupabaseClient) {
  const repo = createBookingRepository(supabase);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateBookingRequest) => repo.createBooking(request),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: bookingKeys.forRenter(variables.renter_id) });
      void qc.invalidateQueries({ queryKey: bookingKeys.forOwner(variables.owner_id) });
    },
  });
}

export function useUpdateBookingStatus(supabase: SupabaseClient) {
  const repo = createBookingRepository(supabase);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      repo.updateBookingStatus(id, status),
    onSuccess: (data) => invalidateBooking(qc, data),
  });
}

export function useRequestReturn(supabase: SupabaseClient) {
  const repo = createBookingRepository(supabase);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repo.requestReturn(id),
    onSuccess: (data) => invalidateBooking(qc, data),
  });
}

export function useConfirmReturn(supabase: SupabaseClient) {
  const repo = createBookingRepository(supabase);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      condition,
      notes,
      photoUrls,
    }: {
      id: string;
      condition: ReturnCondition;
      notes?: string;
      photoUrls?: string[];
    }) => repo.confirmReturn(id, { condition, notes, photoUrls }),
    onSuccess: (data) => invalidateBooking(qc, data),
  });
}
