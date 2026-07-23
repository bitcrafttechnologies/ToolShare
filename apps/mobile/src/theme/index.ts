/**
 * Typed access to the design tokens for imperative code (tab tints,
 * ActivityIndicator colors, react-native-calendars theme, etc.).
 * Tailwind classes get the same values via tailwind.config.js.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const colors = require('./colors') as {
  primary: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700, string>;
  stone: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
  success: Record<50 | 100 | 500 | 600, string>;
  warning: Record<50 | 100 | 500 | 600, string>;
  error: Record<50 | 100 | 500 | 600, string>;
  gold: Record<50 | 100 | 500 | 600, string>;
  category: Record<string, string>;
};

export { colors };

/** Accent for a category slug, falling back to terracotta. */
export function categoryColor(slug: string | undefined | null): string {
  return (slug && colors.category[slug]) || colors.primary[500];
}
