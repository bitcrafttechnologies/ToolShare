import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string | undefined;
}

/** Pulsing placeholder block. Size/shape via className (e.g. "h-4 w-32 rounded-sm"). */
export function Skeleton({ className }: SkeletonProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.5, { duration: 600 }), withTiming(1, { duration: 600 })),
      -1,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={style} className={cn('rounded bg-stone-200', className)} />
  );
}

/** Placeholder matching ToolCard's layout (Figma skeleton-loading 2075:158). */
export function SkeletonToolCard({ className }: SkeletonProps) {
  return (
    <View className={cn('mb-4 overflow-hidden rounded-md border border-border bg-surface', className)}>
      <Skeleton className="h-[200px] w-full rounded-none" />
      <View className="gap-2 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <View className="flex-row items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-10" />
        </View>
      </View>
    </View>
  );
}
