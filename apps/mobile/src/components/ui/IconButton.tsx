import { Pressable, type PressableProps } from 'react-native';
import { Icon, type IconName } from './Icon';
import { colors } from '@/theme';
import { cn } from '@/lib/cn';

type IconButtonVariant = 'fab' | 'overlay' | 'plain';

const containerClasses: Record<IconButtonVariant, string> = {
  // Circular terracotta FAB (Figma "Icon Circle")
  fab: 'h-14 w-14 items-center justify-center rounded-full bg-primary-500 shadow-lg',
  // Floating button over imagery (gallery back/heart)
  overlay: 'h-10 w-10 items-center justify-center rounded-full bg-white/90',
  plain: 'h-10 w-10 items-center justify-center rounded-full',
};

interface IconButtonProps extends Omit<PressableProps, 'children' | 'className'> {
  name: IconName;
  variant?: IconButtonVariant | undefined;
  size?: number | undefined;
  color?: string | undefined;
  className?: string | undefined;
}

export function IconButton({
  name,
  variant = 'plain',
  size,
  color,
  className,
  ...props
}: IconButtonProps) {
  const resolvedColor = color ?? (variant === 'fab' ? '#ffffff' : colors.stone[700]);
  const resolvedSize = size ?? (variant === 'fab' ? 24 : 20);
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      className={cn(containerClasses[variant], className)}
      {...props}
    >
      <Icon name={name} size={resolvedSize} color={resolvedColor} />
    </Pressable>
  );
}
