import { View } from 'react-native';
import { cn } from '@/lib/cn';

interface ProgressBarProps {
  /** 0–1 fill fraction; or pass step/totalSteps instead. */
  value?: number | undefined;
  step?: number | undefined;
  totalSteps?: number | undefined;
  className?: string | undefined;
}

export function ProgressBar({ value, step, totalSteps, className }: ProgressBarProps) {
  const fraction =
    value ?? (step != null && totalSteps ? Math.min(Math.max(step / totalSteps, 0), 1) : 0);
  return (
    <View className={cn('h-1 w-full overflow-hidden rounded-full bg-stone-200', className)}>
      <View className="h-full rounded-full bg-primary-500" style={{ width: `${fraction * 100}%` }} />
    </View>
  );
}
