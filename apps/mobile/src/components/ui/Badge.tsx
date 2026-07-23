import { View } from 'react-native';
import type { BookingStatus } from '@toolshare/types';
import { AppText } from './Text';
import { Icon, type IconName } from './Icon';
import { colors } from '@/theme';
import { cn } from '@/lib/cn';

export type BadgeTone = 'category' | 'success' | 'warning' | 'error' | 'neutral' | 'gold';

const toneClasses: Record<BadgeTone, { container: string; text: string }> = {
  category: { container: 'bg-primary-50', text: 'text-primary-600' },
  success: { container: 'bg-success-50', text: 'text-success-600' },
  warning: { container: 'bg-warning-50', text: 'text-warning-600' },
  error: { container: 'bg-error-50', text: 'text-error-600' },
  neutral: { container: 'bg-stone-100', text: 'text-stone-600' },
  gold: { container: 'bg-gold-50', text: 'text-gold-600' },
};

const toneIconColor: Record<BadgeTone, string> = {
  category: colors.primary[600],
  success: colors.success[600],
  warning: colors.warning[600],
  error: colors.error[600],
  neutral: colors.stone[600],
  gold: colors.gold[600],
};

interface BadgeProps {
  label: string;
  tone?: BadgeTone | undefined;
  icon?: IconName | undefined;
  className?: string | undefined;
}

export function Badge({ label, tone = 'neutral', icon, className }: BadgeProps) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-1 self-start rounded-full px-2.5 py-1',
        toneClasses[tone].container,
        className,
      )}
    >
      {icon ? <Icon name={icon} size={12} color={toneIconColor[tone]} /> : null}
      <AppText variant="label" className={toneClasses[tone].text}>
        {label}
      </AppText>
    </View>
  );
}

// Figma status pills: Active / Pending / Declined / Completed
const statusToneMap: Record<BookingStatus, { tone: BadgeTone; label: string }> = {
  pending: { tone: 'warning', label: 'Pending' },
  confirmed: { tone: 'success', label: 'Confirmed' },
  active: { tone: 'success', label: 'Active' },
  completed: { tone: 'neutral', label: 'Completed' },
  cancelled: { tone: 'error', label: 'Declined' },
  disputed: { tone: 'error', label: 'Disputed' },
};

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string | undefined;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { tone, label } = statusToneMap[status];
  return <Badge label={label} tone={tone} className={className} />;
}
