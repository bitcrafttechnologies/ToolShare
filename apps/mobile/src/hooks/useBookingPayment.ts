import { useStripe } from '@stripe/stripe-react-native';
import { useCreateBooking, createPaymentRepository } from '@toolshare/supabase';
import type { Tool } from '@toolshare/types';
import type { PriceSummary } from '@toolshare/domain';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { useBookingStore } from '@/stores/booking';

/**
 * Booking creation + Stripe PaymentSheet sequence, extracted verbatim from the
 * previous single-file wizard. Keep the ordering intact: create booking →
 * in_person short-circuit → payment intent → init sheet → present sheet
 * (Canceled is a silent return) → confirm booking.
 */
export function useBookingPayment(toolId: string, tool: Tool | null | undefined) {
  const { user } = useAuthStore();
  const store = useBookingStore();
  const createBooking = useCreateBooking(supabase);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  async function handlePayment(summary: PriceSummary | null) {
    if (!tool || !user || !summary || !store.startDate || !store.endDate) return;
    store.setLoading(true);
    store.setError(null);
    try {
      const booking = await createBooking.mutateAsync({
        tool_id: toolId,
        renter_id: user.id,
        owner_id: tool.owner_id,
        start_date: store.startDate,
        end_date: store.endDate,
        total_price: summary.subtotal,
        deposit_amount: summary.deposit,
        payment_method: store.paymentMethod,
      });

      if (store.paymentMethod === 'in_person') {
        store.setBookingId(booking.id);
        store.setStep('confirmation');
        return;
      }

      const payRepo = createPaymentRepository(supabase);
      const intent = await payRepo.createPaymentIntent(booking.id);

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Toolshare',
        paymentIntentClientSecret: intent.clientSecret,
      });
      if (initError) throw new Error(initError.message);

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code === 'Canceled') return;
        throw new Error(presentError.message);
      }

      await payRepo.confirmBooking(booking.id, intent.paymentIntentId);
      store.setBookingId(booking.id);
      store.setStep('confirmation');
    } catch (err) {
      store.setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      store.setLoading(false);
    }
  }

  return { handlePayment };
}
