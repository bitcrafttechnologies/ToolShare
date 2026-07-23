import { View } from 'react-native';
import type { PaymentMethodType } from '@toolshare/types';
import { PAYMENT_METHOD_LABELS } from '@toolshare/types';
import type { PriceSummary } from '@toolshare/domain';
import { AppText, Button } from '@/components/ui';
import { PriceSummaryCard } from './PriceSummaryCard';

interface StepPaymentProps {
  summary: PriceSummary | null;
  paymentMethod: PaymentMethodType;
  isLoading: boolean;
  onBack: () => void;
  onPay: () => void;
}

export function StepPayment({
  summary,
  paymentMethod,
  isLoading,
  onBack,
  onPay,
}: StepPaymentProps) {
  return (
    <View className="gap-5">
      <AppText className="font-heading text-h2 text-stone-900">Payment</AppText>

      {summary ? <PriceSummaryCard summary={summary} /> : null}

      <AppText variant="body-sm">
        Paying with {PAYMENT_METHOD_LABELS[paymentMethod]}.
        {paymentMethod === 'in_person'
          ? ' Your request will be sent to the owner to arrange payment.'
          : ' You’ll confirm the details on the next screen.'}
      </AppText>

      <View className="flex-row gap-3">
        <Button
          label="Back"
          variant="secondary"
          className="flex-1 border-border"
          disabled={isLoading}
          onPress={onBack}
        />
        <Button
          label={paymentMethod === 'in_person' ? 'Send request' : 'Pay now'}
          className="flex-1"
          loading={isLoading}
          onPress={onPay}
        />
      </View>
    </View>
  );
}
