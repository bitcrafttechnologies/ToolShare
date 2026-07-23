import { View } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from './Text';
import { cn } from '@/lib/cn';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const sizeMap: Record<AvatarSize, { box: number; text: string }> = {
  xs: { box: 24, text: 'text-[10px]' },
  sm: { box: 32, text: 'text-xs' },
  md: { box: 40, text: 'text-sm' },
  lg: { box: 48, text: 'text-base' },
  xl: { box: 64, text: 'text-h2' },
  xxl: { box: 80, text: 'text-h1' },
};

interface AvatarProps {
  name?: string | null | undefined;
  uri?: string | null | undefined;
  size?: AvatarSize | undefined;
  className?: string | undefined;
}

function initials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ name, uri, size = 'md', className }: AvatarProps) {
  const { box, text } = sizeMap[size];
  return (
    <View
      className={cn('items-center justify-center overflow-hidden rounded-full bg-primary-600', className)}
      style={{ width: box, height: box }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: box, height: box }} contentFit="cover" transition={100} />
      ) : (
        <AppText className={cn('font-body-semibold text-white', text)}>{initials(name)}</AppText>
      )}
    </View>
  );
}
