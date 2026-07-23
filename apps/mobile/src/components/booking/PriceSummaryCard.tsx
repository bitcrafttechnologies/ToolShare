import { View } from 'react-native';
import type { PriceSummary } from '@toolshare/domain';
import { AppText, Card } from '@/components/ui';

interface PriceSummaryCardProps {
  summary: PriceSummary;
  /** Optional heading rows above the totals (tool title / date range). */
  title?: string | undefined;
  subtitle?: string | undefined;
  className?: string | undefined;
}

export function PriceSummaryCard({ summary, title, subtitle, className }: PriceSummaryCardProps) {
  return (
    <Card className={className}>
      {title ? (
        <AppText className="font-body-semibold text-base text-stone-900">{title}</AppText>
      ) : null}
      {subtitle ? (
        <AppText variant="caption" className="mb-3 mt-1">
          {subtitle}
        </AppText>
      ) : null}
      {/* gap-*, not space-y-* — RN has no sibling selectors */}
      <View className="gap-2">
        <View className="flex-row justify-between">
          <AppText variant="body-sm">{summary.rateDescription}</AppText>
          <AppText variant="body-sm" className="text-stone-900">
            ${summary.subtotal.toFixed(2)}
          </AppText>
        </View>
        <View className="flex-row justify-between">
          <AppText variant="body-sm">Deposit (refundable)</AppText>
          <AppText variant="body-sm" className="text-stone-900">
            ${summary.deposit.toFixed(2)}
          </AppText>
        </View>
        <View className="mt-1 flex-row justify-between border-t border-border pt-3">
          <AppText className="font-body-semibold text-base text-stone-900">Total</AppText>
          <AppText className="font-body-semibold text-base text-stone-900">
            ${summary.total.toFixed(2)}
          </AppText>
        </View>
      </View>
    </Card>
  );
}
