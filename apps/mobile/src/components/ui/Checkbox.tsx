import { Pressable, View } from 'react-native';
import { AppText } from './Text';
import { Icon } from './Icon';
import { cn } from '@/lib/cn';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string | undefined;
  className?: string | undefined;
}

export function Checkbox({ checked, onChange, label, className }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      hitSlop={8}
      className={cn('flex-row items-center gap-3', className)}
      onPress={() => onChange(!checked)}
    >
      <View
        className={cn(
          'h-5 w-5 items-center justify-center rounded-sm border',
          checked ? 'border-primary-500 bg-primary-500' : 'border-border-strong bg-surface',
        )}
      >
        {checked ? <Icon name="checkmark" size={14} color="#ffffff" /> : null}
      </View>
      {label ? <AppText variant="body-sm" className="flex-1">{label}</AppText> : null}
    </Pressable>
  );
}
