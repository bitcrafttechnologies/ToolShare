import { View, type ViewProps } from 'react-native';
import { cn } from '@/lib/cn';

interface CardProps extends Omit<ViewProps, 'className'> {
  className?: string | undefined;
}

export function Card({ className, ...props }: CardProps) {
  return <View className={cn('rounded-md border border-border bg-surface p-4', className)} {...props} />;
}
