import {
  Drill,
  Hammer,
  Trees,
  Blocks,
  Car,
  Wrench,
  Zap,
  Truck,
  MoveVertical,
  Flame,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@toolshare/lib";
import { isToolCategory, type ToolCategory } from "./category-tag";

/**
 * CategoryIcon
 * ----------------------------------------------------------------------
 * Glyph for each of the ten `categories` rows.
 *
 * Note this maps from `categories.slug`, NOT from `categories.icon_name`.
 * The `icon_name` column holds Material Symbols names ("power_rounded",
 * "build_rounded") which the Expo app resolves against @expo/vector-icons;
 * on web there is no Material set, so the slug — which is equally
 * authoritative and already the key for the color tokens — drives the
 * lookup instead. Keep this map and the `--color-cat-*` tokens in step.
 */
const categoryIcons: Record<ToolCategory, LucideIcon> = {
  "power-tools": Drill,
  "hand-tools": Hammer,
  landscaping: Trees,
  concrete: Blocks,
  automotive: Car,
  plumbing: Wrench,
  electrical: Zap,
  trailers: Truck,
  aerial: MoveVertical,
  welding: Flame,
};

export interface CategoryIconProps {
  /** A `categories.slug`. Unknown values fall back to a generic tool glyph. */
  category: string;
  size?: number;
  className?: string;
  /** Tints the glyph with the category's own accent token. */
  tinted?: boolean;
}

export function CategoryIcon({
  category,
  size = 20,
  className,
  tinted,
}: CategoryIconProps) {
  const Glyph = isToolCategory(category) ? categoryIcons[category] : Sparkles;

  return (
    <Glyph
      size={size}
      aria-hidden="true"
      className={cn(className)}
      style={
        tinted && isToolCategory(category)
          ? { color: `var(--color-cat-${category})` }
          : undefined
      }
    />
  );
}
