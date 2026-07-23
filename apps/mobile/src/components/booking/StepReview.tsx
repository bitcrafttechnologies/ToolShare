import { View } from 'react-native';
import type { Tool, PaymentMethodType } from '@toolshare/types';
import { PAYMENT_METHOD_LABELS } from '@toolshare/types';
import type { PriceSummary } from '@toolshare/domain';
import { AppText, Button, RadioRow } from '@/components/ui';
import { PriceSummaryCard } from './PriceSummaryCard';

const PAYMENT_METHODS: PaymentMethodType[] = ['stripe_card', 'cash_app', 'in_person'];

const PAYMENT_METHOD_HINTS: Record<PaymentMethodType, string> = {
  stripe_card: 'Pay securely by card now',
  cash_app: 'Pay with your Cash App balance',
  in_person: 'Arrange payment directly with the owner',
};

interface StepReviewProps {
  tool: Tool;
  startDate: string | null;
  endDate: string | null;
  summary: PriceSummary;
  paymentMethod: PaymentMethodType;
  onSelectPaymentMethod: (method: PaymentMethodType) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function StepReview({
  tool,
  startDate,
  endDate,
  summary,
  paymentMethod,
  onSelectPaymentMethod,
  onBack,
  onContinue,
}: StepReviewProps) {
  return (
    <View className="gap-5">
      <AppText className="font-heading text-h2 text-stone-900">Review booking</AppText>

      <PriceSummaryCard
        summary={summary}
        title={tool.title}
        {...(startDate && endDate ? { subtitle: `${startDate} → ${endDate}` } : {})}
      />

      <View className="gap-2">
        <AppText variant="label">Payment method</AppText>
        {PAYMENT_METHODS.map((method) => (
          <RadioRow
            key={method}
            selected={paymentMethod === method}
            onPress={() => onSelectPaymentMethod(method)}
            label={PAYMENT_METHOD_LABELS[method]}
            description={PAYMENT_METHOD_HINTS[method]}
          />
        ))}
      </View>

      <View className="flex-row gap-3">
        <Button label="Back" variant="secondary" className="flex-1 border-border" onPress={onBack} />
        <Button label="Continue" className="flex-1" onPress={onContinue} />
      </View>
    </View>
  );
}
