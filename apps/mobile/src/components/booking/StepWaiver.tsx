import { ScrollView, View } from 'react-native';
import type { Tool } from '@toolshare/types';
import { AppText, Button, Card, Checkbox } from '@/components/ui';

interface StepWaiverProps {
  tool: Tool;
  accepted: boolean;
  onChangeAccepted: (accepted: boolean) => void;
  onBack: () => void;
  onAccept: () => void;
}

export function StepWaiver({ tool, accepted, onChangeAccepted, onBack, onAccept }: StepWaiverProps) {
  return (
    <View className="gap-5">
      <AppText className="font-heading text-h2 text-stone-900">Rental agreement</AppText>

      <Card className="max-h-64 bg-surface-muted">
        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
          <AppText className="mb-2 font-body-semibold text-base text-stone-900">
            Toolshare Rental Agreement
          </AppText>
          <AppText variant="body-sm" className="leading-6">
            By accepting, you agree to use {tool.title} safely and return it in the same condition.
            You are responsible for damage beyond normal wear. A ${tool.deposit_amount} deposit will
            be held. This constitutes a valid electronic signature under UETA (AZ Rev. Stat. §
            44-7001 et seq.).
          </AppText>
        </ScrollView>
      </Card>

      <Checkbox
        checked={accepted}
        onChange={onChangeAccepted}
        label="I agree to the rental agreement and waiver"
      />

      <View className="flex-row gap-3">
        <Button label="Back" variant="secondary" className="flex-1 border-border" onPress={onBack} />
        <Button
          label="Accept & pay"
          className="flex-1"
          disabled={!accepted}
          onPress={onAccept}
        />
      </View>
    </View>
  );
}
