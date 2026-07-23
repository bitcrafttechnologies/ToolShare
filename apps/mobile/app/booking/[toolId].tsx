import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTool, useBlockedDates } from '@toolshare/supabase';
import { calculateBookingPrice, checkToolAvailability } from '@toolshare/domain';
import { supabase } from '@/lib/supabase';
import { useBookingStore, type BookingStep } from '@/stores/booking';
import { useBookingPayment } from '@/hooks/useBookingPayment';
import { AppText, Card, EmptyState, Icon, ProgressBar, Spinner } from '@/components/ui';
import {
  StepConfirmation,
  StepDates,
  StepPayment,
  StepReview,
  StepWaiver,
} from '@/components/booking';
import { colors } from '@/theme';

// Figma booking-checkout (2038:9). Thin orchestrator: the screen stays mounted
// across steps so the Stripe sheet is never unmounted mid-presentation.
const STEP_LABELS: Record<BookingStep, string> = {
  dates: 'Choose your dates',
  review: 'Review your booking',
  waiver: 'Rental agreement',
  payment: 'Payment',
  confirmation: 'Confirmed',
};

const STEP_INDEX: Record<BookingStep, number> = {
  dates: 1,
  review: 2,
  waiver: 3,
  payment: 4,
  confirmation: 4,
};

export default function BookingFlowScreen() {
  const { toolId } = useLocalSearchParams<{ toolId: string }>();
  const store = useBookingStore();
  const { data: tool, isLoading } = useTool(supabase, toolId);
  const { data: blockedDates = [] } = useBlockedDates(supabase, toolId);
  const { handlePayment } = useBookingPayment(toolId, tool);

  if (isLoading) {
    return <Spinner cover className="bg-background" />;
  }

  if (!tool) {
    return (
      <View className="flex-1 bg-background">
        <EmptyState
          icon="alert-circle-outline"
          title="Tool not found"
          message="This listing may have been removed."
          actionLabel="Back to browse"
          onAction={() => router.push('/search')}
        />
      </View>
    );
  }

  const summary =
    store.startDate && store.endDate
      ? calculateBookingPrice(tool, new Date(store.startDate), new Date(store.endDate))
      : null;

  const availability =
    store.startDate && store.endDate
      ? checkToolAvailability(blockedDates, new Date(store.startDate), new Date(store.endDate))
      : null;

  const isConfirmed = store.step === 'confirmation' && store.bookingId;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      {!isConfirmed ? (
        <View className="mb-6 gap-2">
          <ProgressBar step={STEP_INDEX[store.step]} totalSteps={4} />
          <AppText variant="caption">
            Step {STEP_INDEX[store.step]} of 4 · {STEP_LABELS[store.step]}
          </AppText>
        </View>
      ) : null}

      {store.error ? (
        <Card className="mb-4 flex-row items-start gap-3 border-error-100 bg-error-50">
          <Icon name="alert-circle" size={20} color={colors.error[500]} />
          <AppText variant="body-sm" className="flex-1 text-error-600">
            {store.error}
          </AppText>
        </Card>
      ) : null}

      {isConfirmed ? (
        <StepConfirmation
          onViewBooking={() => {
            const id = store.bookingId;
            store.reset();
            router.push(`/bookings/${id}`);
          }}
          onBackHome={() => {
            store.reset();
            router.replace('/(tabs)/');
          }}
        />
      ) : store.step === 'waiver' ? (
        <StepWaiver
          tool={tool}
          accepted={store.waiverAccepted}
          onChangeAccepted={store.setWaiverAccepted}
          onBack={() => store.setStep('review')}
          onAccept={store.acceptWaiver}
        />
      ) : store.step === 'payment' ? (
        <StepPayment
          summary={summary}
          paymentMethod={store.paymentMethod}
          isLoading={store.isLoading}
          onBack={() => store.setStep('waiver')}
          onPay={() => handlePayment(summary)}
        />
      ) : store.step === 'review' && summary ? (
        <StepReview
          tool={tool}
          startDate={store.startDate}
          endDate={store.endDate}
          summary={summary}
          paymentMethod={store.paymentMethod}
          onSelectPaymentMethod={store.setPaymentMethod}
          onBack={() => store.setStep('dates')}
          onContinue={() => store.setStep('waiver')}
        />
      ) : (
        <StepDates
          tool={tool}
          blockedDates={blockedDates}
          startDate={store.startDate}
          endDate={store.endDate}
          summary={summary}
          availability={availability}
          onChangeDates={store.setDates}
          onContinue={() => store.setStep('review')}
        />
      )}
    </ScrollView>
  );
}
