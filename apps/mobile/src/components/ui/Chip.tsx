import { Pressable } from 'react-native';
import { AppText } from './Text';
import { CategoryIcon } from './Icon';
import { colors } from '@/theme';
import { cn } from '@/lib/cn';

interface ChipProps {
  label: string;
  /** DB `categories.icon_name` — renders a leading category icon. */
  iconName?: string | null | undefined;
  selected?: boolean | undefined;
  /** Accent color (category color); tints icon + selected state. */
  accent?: string | undefined;
  onPress?: (() => void) | undefined;
  className?: string | undefined;
}

export function Chip({ label, iconName, selected = false, accent, onPress, className }: ChipProps) {
  const tint = accent ?? colors.primary[500];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-1.5 rounded-full border px-3 py-2',
        selected ? 'border-primary-500 bg-primary-50' : 'border-border bg-surface',
        className,
      )}
    >
      {iconName !== undefined ? (
        <CategoryIcon iconName={iconName} size={16} color={selected ? colors.primary[600] : tint} />
      ) : null}
      <AppText
        variant="label"
        className={selected ? 'text-primary-600' : 'text-stone-700'}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
