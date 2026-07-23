import { View } from 'react-native';
import { AppText } from './Text';
import { Icon, type IconName } from './Icon';
import { Button } from './Button';
import { colors } from '@/theme';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message?: string | undefined;
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
  className?: string | undefined;
}

export function EmptyState({ icon, title, message, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <View className={cn('flex-1 items-center justify-center px-8 py-16', className)}>
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-primary-50">
        <Icon name={icon} size={28} color={colors.primary[500]} />
      </View>
      <AppText variant="h2" className="text-center">
        {title}
      </AppText>
      {message ? (
        <AppText variant="body-sm" className="mt-2 text-center text-stone-500">
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} size="sm" className="mt-6" />
      ) : null}
    </View>
  );
}
