import { Pressable, type PressableProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { AppText } from './Text';
import { Spinner } from './Spinner';
import { Icon, type IconName } from './Icon';
import { colors } from '@/theme';
import { cn } from '@/lib/cn';

// Classes land on the Pressable itself so caller layout (`flex-1`, `w-full`)
// and visual overrides both apply to the real box. An inner wrapper would
// swallow layout classes and clip the label.
const button = cva('flex-row items-center justify-center gap-2 rounded-md', {
  variants: {
    variant: {
      primary: 'bg-primary-500',
      secondary: 'border border-primary-500 bg-transparent',
      ghost: 'bg-transparent',
      destructive: 'bg-error-500',
    },
    size: {
      md: 'min-h-[52px] px-6 py-4',
      sm: 'min-h-[40px] px-4 py-2',
    },
    disabled: {
      true: 'opacity-40',
      false: '',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

type ButtonVariant = NonNullable<VariantProps<typeof button>['variant']>;

const labelColor: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-primary-500',
  ghost: 'text-primary-500',
  destructive: 'text-white',
};

const iconColor: Record<ButtonVariant, string> = {
  primary: '#ffffff',
  secondary: colors.primary[500],
  ghost: colors.primary[500],
  destructive: '#ffffff',
};

interface ButtonProps
  extends Omit<PressableProps, 'children' | 'disabled' | 'className' | 'style'>,
    Pick<VariantProps<typeof button>, 'variant' | 'size'> {
  label: string;
  loading?: boolean | undefined;
  disabled?: boolean | undefined;
  icon?: IconName | undefined;
  className?: string | undefined;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(button({ variant, size, disabled: isDisabled }), className)}
      // Pressed feedback via opacity — a Pressable cannot vary its own
      // className from its pressed state.
      style={({ pressed }) => (pressed && !isDisabled ? { opacity: 0.85 } : null)}
      {...props}
    >
      {loading ? (
        <Spinner size="small" />
      ) : icon ? (
        <Icon name={icon} size={size === 'sm' ? 16 : 20} color={iconColor[variant ?? 'primary']} />
      ) : null}
      <AppText
        className={cn(
          size === 'sm' ? 'font-body-semibold text-sm' : 'font-body-semibold text-base',
          labelColor[variant ?? 'primary'],
        )}
      >
        {loading ? 'Loading…' : label}
      </AppText>
    </Pressable>
  );
}
