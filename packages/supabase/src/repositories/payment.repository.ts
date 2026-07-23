import type { SupabaseClient } from '@supabase/supabase-js';

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

export function createPaymentRepository(supabase: SupabaseClient) {
  return {
    async createPaymentIntent(bookingId: string): Promise<PaymentIntentResult> {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { bookingId },
      });
      if (error) throw error;
      return data as PaymentIntentResult;
    },

    async confirmBooking(bookingId: string, paymentIntentId: string): Promise<void> {
      const { error } = await supabase.functions.invoke('confirm-booking', {
        body: { bookingId, paymentIntentId },
      });
      if (error) throw error;
    },

    async releaseDeposit(
      bookingId: string,
      claimDamage: boolean,
      damageAmount = 0,
    ): Promise<void> {
      const { error } = await supabase.functions.invoke('release-deposit', {
        body: { bookingId, claimDamage, damageAmount },
      });
      if (error) throw error;
    },
  };
}

export type PaymentRepository = ReturnType<typeof createPaymentRepository>;
