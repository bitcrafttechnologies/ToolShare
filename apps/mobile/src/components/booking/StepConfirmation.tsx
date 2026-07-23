import { View } from 'react-native';
import { AppText, Button, Icon } from '@/components/ui';
import { colors } from '@/theme';

interface StepConfirmationProps {
  onViewBooking: () => void;
  onBackHome: () => void;
}

export function StepConfirmation({ onViewBooking, onBackHome }: StepConfirmationProps) {
  return (
    <View className="items-center gap-3 py-8">
      <View className="mb-2 h-16 w-16 items-center justify-center rounded-full bg-success-50">
        <Icon name="checkmark-circle" size={40} color={colors.success[500]} />
      </View>
      <AppText className="font-heading text-h1 text-stone-900">Booking confirmed!</AppText>
      <AppText variant="body-sm" className="mb-6 text-center">
        Your rental is confirmed. The owner will be in touch with pickup details.
      </AppText>
      <Button label="View booking" className="w-full" onPress={onViewBooking} />
      <Button
        label="Back to home"
        variant="secondary"
        className="w-full border-border"
        onPress={onBackHome}
      />
    </View>
  );
}
