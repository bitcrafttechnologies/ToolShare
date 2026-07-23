import { create } from 'zustand';
import type { PaymentMethodType } from '@toolshare/types';
import type { PriceSummary } from '@toolshare/domain';

export type BookingStep = 'dates' | 'review' | 'waiver' | 'payment' | 'confirmation';

interface BookingState {
  step: BookingStep;
  startDate: string | null;
  endDate: string | null;
  priceSummary: PriceSummary | null;
  paymentMethod: PaymentMethodType;
  waiverAccepted: boolean;
  bookingId: string | null;
  error: string | null;
  isLoading: boolean;

  setDates: (start: string, end: string, summary: PriceSummary | null) => void;
  setPaymentMethod: (method: PaymentMethodType) => void;
  /** Toggle the waiver checkbox. */
  setWaiverAccepted: (accepted: boolean) => void;
  /** Confirm the waiver and advance to payment. */
  acceptWaiver: () => void;
  setStep: (step: BookingStep) => void;
  setBookingId: (id: string) => void;
  setError: (msg: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  step: 'dates' as BookingStep,
  startDate: null,
  endDate: null,
  priceSummary: null,
  paymentMethod: 'stripe_card' as PaymentMethodType,
  waiverAccepted: false,
  bookingId: null,
  error: null,
  isLoading: false,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setDates: (start, end, summary) =>
    set({ startDate: start, endDate: end, priceSummary: summary }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  setWaiverAccepted: (waiverAccepted) => set({ waiverAccepted }),

  acceptWaiver: () => set({ waiverAccepted: true, step: 'payment' }),

  setStep: (step) => set({ step }),

  setBookingId: (id) => set({ bookingId: id }),

  setError: (error) => set({ error }),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () => set(initialState),
}));
