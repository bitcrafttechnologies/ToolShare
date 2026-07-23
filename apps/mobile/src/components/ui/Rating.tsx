import { View } from 'react-native';
import { AppText } from './Text';
import { Icon } from './Icon';
import { colors } from '@/theme';
import { cn } from '@/lib/cn';

interface RatingProps {
  value: number;
  /** Review count, shown as "(12)" after the value. */
  count?: number | undefined;
  /** Show all five stars (Figma reference rows) vs a single star + number. */
  full?: boolean | undefined;
  size?: number | undefined;
  className?: string | undefined;
}

export function Rating({ value, count, full = false, size = 14, className }: RatingProps) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <View className={cn('flex-row items-center gap-1', className)}>
      {full ? (
        <View className="flex-row items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon
              key={star}
              name={rounded >= star ? 'star' : rounded >= star - 0.5 ? 'star-half' : 'star-outline'}
              size={size}
              color={colors.gold[500]}
            />
          ))}
        </View>
      ) : (
        <Icon name="star" size={size} color={colors.gold[500]} />
      )}
      <AppText variant="label" className="text-stone-900">
        {value.toFixed(1)}
      </AppText>
      {count != null ? <AppText variant="caption">({count})</AppText> : null}
    </View>
  );
}
