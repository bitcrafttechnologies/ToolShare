/**
 * Toolshare design tokens — single source of truth for color.
 * Extracted from Figma "Toolshed" component-reference (node 2079:4).
 *
 * CommonJS on purpose: tailwind.config.js `require()`s this file, and TS code
 * imports it via src/theme/index.ts, so Tailwind classes and imperative code
 * (tab tints, spinners, calendar theme) can never drift apart.
 *
 * NOTE: app.json cannot import JS — its splash/adaptiveIcon/notification
 * colors must be kept in sync with primary[500] by hand.
 */
module.exports = {
  // Figma "Terracotta"
  primary: {
    50: '#FFF1EB',
    100: '#F9D9C9',
    200: '#F5BD9A',
    300: '#E49C7B',
    400: '#D37B5C',
    500: '#C25A3D',
    600: '#A84E33',
    700: '#8E3E29',
  },
  // Figma "Neutral" (warm). 800 interpolated — not in the Figma palette.
  stone: {
    50: '#FAF9F6',
    100: '#F2F1ED',
    200: '#E5E1DB',
    300: '#D6D4CD',
    400: '#B1ADA8',
    500: '#9CA3AF',
    600: '#66625E',
    700: '#4E4E4E',
    800: '#333130',
    900: '#1A1A1A',
  },
  // Figma defines the 500s; 50/100/600 are standard companions of the same
  // hue (each 500 sits exactly on a Tailwind ramp) for badge tints and
  // pressed states.
  success: { 50: '#ECFDF5', 100: '#D1FAE5', 500: '#059669', 600: '#047857' },
  warning: { 50: '#FFFBEB', 100: '#FEF3C7', 500: '#D97706', 600: '#B45309' },
  error: { 50: '#FEF2F2', 100: '#FEE2E2', 500: '#DC2626', 600: '#B91C1C' },
  gold: { 50: '#FBF7E8', 100: '#F5EACB', 500: '#D4AF37', 600: '#B3922C' },
  // Category accents keyed by DB `categories.slug`. First three are the
  // explicit Figma swatches (Power / Garden / Auto); the rest are assigned
  // from the palette above — true up per-screen if the feed design differs.
  category: {
    'power-tools': '#FF4500',
    landscaping: '#4A6741',
    automotive: '#FFBF00',
    'hand-tools': '#A84E33',
    concrete: '#66625E',
    plumbing: '#D37B5C',
    electrical: '#D4AF37',
    trailers: '#8E3E29',
    aerial: '#D97706',
    welding: '#DC2626',
  },
};
