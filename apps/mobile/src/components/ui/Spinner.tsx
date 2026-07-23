import { ActivityIndicator, View } from 'react-native';
import { colors } from '@/theme';
import { cn } from '@/lib/cn';

interface SpinnerProps {
  size?: 'small' | 'large' | undefined;
  /** Fill the available space and center (the common loading-screen case). */
  cover?: boolean | undefined;
  className?: string | undefined;
}

export function Spinner({ size = 'large', cover = false, className }: SpinnerProps) {
  const indicator = <ActivityIndicator size={size} color={colors.primary[500]} />;
  if (!cover && !className) return indicator;
  return (
    <View className={cn(cover && 'flex-1 items-center justify-center', className)}>{indicator}</View>
  );
}
