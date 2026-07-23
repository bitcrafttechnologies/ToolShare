import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { AppText } from './Text';
import { Icon, type IconName } from './Icon';
import { colors } from '@/theme';
import { cn } from '@/lib/cn';

interface TextFieldProps extends Omit<TextInputProps, 'className'> {
  label?: string | undefined;
  error?: string | undefined;
  hint?: string | undefined;
  leftIcon?: IconName | undefined;
  className?: string | undefined;
  inputClassName?: string | undefined;
}

export function TextField({
  label,
  error,
  hint,
  leftIcon,
  className,
  inputClassName,
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className={cn(className)}>
      {label ? (
        <AppText variant="label" className={cn('mb-1.5', error && 'text-error-500')}>
          {label}
        </AppText>
      ) : null}
      <View
        className={cn(
          'flex-row items-center gap-2 rounded-md border bg-surface px-4',
          error ? 'border-error-500' : focused ? 'border-primary-500' : 'border-border-strong',
        )}
      >
        {leftIcon ? (
          <Icon name={leftIcon} size={18} color={focused ? colors.primary[500] : colors.stone[400]} />
        ) : null}
        <TextInput
          className={cn('min-h-12 flex-1 py-3 font-body text-base text-stone-900', inputClassName)}
          placeholderTextColor={colors.stone[400]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {error ? <Icon name="alert-circle" size={18} color={colors.error[500]} /> : null}
      </View>
      {error ? (
        <AppText variant="caption" className="mt-1 text-error-500">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" className="mt-1">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}
