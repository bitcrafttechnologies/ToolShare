import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { colors } from '@/theme';
import { cn } from '@/lib/cn';

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string | undefined;
}

const TRACK_WIDTH = 48;
const TRACK_HEIGHT = 28;
const THUMB_SIZE = 22;
const PADDING = (TRACK_HEIGHT - THUMB_SIZE) / 2;

export function Toggle({ value, onChange, className }: ToggleProps) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 160 });
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.stone[300], colors.primary[500]]),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: PADDING + progress.value * (TRACK_WIDTH - THUMB_SIZE - PADDING * 2) }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      hitSlop={8}
      onPress={() => onChange(!value)}
      className={cn(className)}
    >
      <Animated.View
        style={[{ width: TRACK_WIDTH, height: TRACK_HEIGHT, borderRadius: TRACK_HEIGHT / 2, justifyContent: 'center' }, trackStyle]}
      >
        <Animated.View
          style={[
            {
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              backgroundColor: '#ffffff',
              elevation: 2,
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 2,
              shadowOffset: { width: 0, height: 1 },
            },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
