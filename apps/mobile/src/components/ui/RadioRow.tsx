import { Pressable, View } from 'react-native';
import { AppText } from './Text';
import { cn } from '@/lib/cn';

interface RadioRowProps {
  selected: boolean;
  onPress: () => void;
  label: string;
  description?: string | undefined;
  className?: string | undefined;
}

export function RadioRow({ selected, onPress, label, description, className }: RadioRowProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-3 rounded-md border bg-surface p-4',
        selected ? 'border-primary-500 bg-primary-50' : 'border-border',
        className,
      )}
    >
      <View
        className={cn(
          'h-5 w-5 items-center justify-center rounded-full border-2',
          selected ? 'border-primary-500' : 'border-border-strong',
        )}
      >
        {selected ? <View className="h-2.5 w-2.5 rounded-full bg-primary-500" /> : null}
      </View>
      <View className="flex-1">
        <AppText className="font-body-medium text-base text-stone-900">{label}</AppText>
        {description ? (
          <AppText variant="caption" className="mt-0.5">
            {description}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}
