/**
 * Design tokens for Dr!ve.
 *
 * Change colours, spacing and type sizes HERE – every screen reads from these values.
 * `palette` holds raw colours; the semantic colours per theme live in `themes.ts`.
 */

export const palette = {
  // Brand blues
  navy950: '#070F2B', // dark background (also native splash)
  navy900: '#0B1B4D', // primary deep blue
  navy800: '#132A6B',
  navy700: '#1D3A8A',
  navy100: '#E3E8F7',
  navy50: '#F3F5FC',

  // Decorative purple curves (gradient start → end)
  purple500: '#7B4DFF',
  purple300: '#A77BFF',

  // Accent orange (buttons, gauge needle, highlights)
  orange500: '#FF8A2A',
  orange600: '#E8741A',
  orange100: '#FFE7D3',

  // Neutrals
  white: '#FFFFFF',
  gray100: '#E9ECF4',
  gray300: '#B5BCD3',
  gray500: '#7A84A6',
  gray700: '#3A4466',
  black: '#000000',

  // Status
  green500: '#2BD48A',
  red500: '#FF4D6A',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const fontSize = {
  caption: 12,
  small: 14,
  body: 16,
  title: 20,
  headline: 26,
  display: 40,
  gauge: 72,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  bold: '700',
  black: '900',
} as const;

export const lineHeight = {
  tight: 1.15,
  normal: 1.4,
} as const;

/** Durations in ms, shared by UI animations. */
export const motion = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

/** Wordmark colours (used by the logo, splash and app icon). */
export const brand = {
  wordmark: palette.white,
  exclamation: palette.orange500,
  curveFrom: palette.purple500,
  curveTo: palette.purple300,
  splashBackground: palette.navy950,
} as const;
