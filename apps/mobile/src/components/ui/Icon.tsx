import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { colors } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

interface IconProps {
  name: IconName;
  size?: number | undefined;
  color?: string | undefined;
}

/** App chrome icon (Ionicons). */
export function Icon({ name, size = 20, color = colors.stone[600] }: IconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

interface CategoryIconProps {
  /** DB `categories.icon_name`, e.g. "power_rounded" or "electrical_services". */
  iconName?: string | null | undefined;
  size?: number | undefined;
  color?: string | undefined;
}

/**
 * Category icon from the DB's Material icon names. MaterialIcons has no
 * `_rounded` variants — strip the suffix and fall back to a generic tool glyph
 * when the name doesn't exist in the set.
 */
export function CategoryIcon({ iconName, size = 20, color = colors.stone[600] }: CategoryIconProps) {
  const base = (iconName ?? '').replace(/_rounded$/, '');
  const glyphMap = MaterialIcons.glyphMap as Record<string, number>;
  const name = (base in glyphMap ? base : 'handyman') as MaterialIconName;
  return <MaterialIcons name={name} size={size} color={color} />;
}
