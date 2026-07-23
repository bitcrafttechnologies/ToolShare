const colors = require('./src/theme/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        stone: colors.stone, // overrides Tailwind default stone with Figma neutrals
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        gold: colors.gold,
        // Semantic surfaces
        background: colors.stone[50],
        surface: '#ffffff',
        'surface-muted': colors.stone[100],
        border: colors.stone[200],
        'border-strong': colors.stone[300],
        'muted-foreground': colors.stone[500],
      },
      // RN does not synthesize weights for custom fonts (Android especially):
      // weight lives in the family utility. Never combine `font-bold` with
      // these — use font-heading / font-body-semibold etc.
      fontFamily: {
        heading: 'Outfit_700Bold',
        'heading-regular': 'Outfit_400Regular',
        'heading-medium': 'Outfit_500Medium',
        'heading-semibold': 'Outfit_600SemiBold',
        'heading-extrabold': 'Outfit_800ExtraBold',
        body: 'Inter_400Regular',
        'body-medium': 'Inter_500Medium',
        'body-semibold': 'Inter_600SemiBold',
        'body-bold': 'Inter_700Bold',
      },
      // Figma type ramp (component-reference 2079:4 + screen frames)
      fontSize: {
        display: ['32px', { lineHeight: '38px' }], // H1 Outfit Bold 32
        h1: ['28px', { lineHeight: '34px' }], // H2 Outfit Bold 28
        '2xl': ['24px', { lineHeight: '30px' }], // Screen titles (dashboard feed)
        h2: ['20px', { lineHeight: '26px' }], // H3 Outfit Medium 20
        xl: ['20px', { lineHeight: '26px' }],
        lg: ['18px', { lineHeight: '24px' }], // Card titles
        base: ['16px', { lineHeight: '24px' }], // Body large Inter 16
        sm: ['14px', { lineHeight: '20px' }], // Body Inter 14
        '13': ['13px', { lineHeight: '18px' }], // Card meta ("Lent by …")
        xs: ['12px', { lineHeight: '16px' }], // Body small / label 12
        micro: ['11px', { lineHeight: '14px' }], // Caption / pill Inter-Outfit 11
      },
      borderRadius: {
        xs: '4px', // category pill on cards
        sm: '8px',
        DEFAULT: '10px',
        md: '12px', // cards, inputs (dashboard feed spec)
        lg: '16px',
        // Legacy `rounded-xl` classes keep a sane 20px until swept in B7.
        xl: '20px',
      },
    },
  },
  plugins: [],
};
