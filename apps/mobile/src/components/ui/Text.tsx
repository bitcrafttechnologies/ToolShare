import { Text, type TextProps } from 'react-native';
import { cn } from '@/lib/cn';

export type TextVariant =
  | 'display' // Outfit Bold 32
  | 'h1' // Outfit Bold 28
  | 'h2' // Outfit Medium 20
  | 'body' // Inter 16
  | 'body-sm' // Inter 14
  | 'label' // Inter Medium 12
  | 'caption'; // Inter 11

const variantClasses: Record<TextVariant, string> = {
  display: 'font-heading text-display text-stone-900',
  h1: 'font-heading text-h1 text-stone-900',
  h2: 'font-heading-medium text-h2 text-stone-900',
  body: 'font-body text-base text-stone-900',
  'body-sm': 'font-body text-sm text-stone-700',
  label: 'font-body-medium text-xs text-stone-700',
  caption: 'font-body text-micro text-stone-500',
};

interface AppTextProps extends Omit<TextProps, 'className'> {
  variant?: TextVariant | undefined;
  className?: string | undefined;
}

export function AppText({ variant = 'body', className, ...props }: AppTextProps) {
  return <Text className={cn(variantClasses[variant], className)} {...props} />;
}
