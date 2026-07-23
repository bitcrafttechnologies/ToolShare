import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { cn } from '@/lib/cn';

interface ScreenProps {
  children: ReactNode;
  /** Safe-area edges to respect. Screens under the tab bar usually want ['top']. */
  edges?: Edge[] | undefined;
  /** Wrap children in a ScrollView. */
  scroll?: boolean | undefined;
  /** Apply the standard 16px horizontal padding. */
  padded?: boolean | undefined;
  className?: string | undefined;
  contentClassName?: string | undefined;
}

export function Screen({
  children,
  edges = ['top'],
  scroll = false,
  padded = true,
  className,
  contentClassName,
}: ScreenProps) {
  const body = scroll ? (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className={cn(padded && 'px-4', 'pb-6', contentClassName)}>{children}</View>
    </ScrollView>
  ) : (
    <View className={cn('flex-1', padded && 'px-4', contentClassName)}>{children}</View>
  );

  return <SafeAreaView edges={edges} className={cn('flex-1 bg-background', className)}>{body}</SafeAreaView>;
}
