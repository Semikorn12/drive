import { useSettings } from '../state/settingsStore';
import { themes, type ThemeColors, type ThemeMode } from './themes';
import { fontSize, fontWeight, lineHeight, motion, palette, radius, spacing } from './tokens';

export * from './tokens';
export * from './themes';

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  lineHeight: typeof lineHeight;
  motion: typeof motion;
  palette: typeof palette;
}

export function buildTheme(mode: ThemeMode): Theme {
  return { mode, colors: themes[mode], spacing, radius, fontSize, fontWeight, lineHeight, motion, palette };
}

const cache: Record<ThemeMode, Theme> = { dark: buildTheme('dark'), light: buildTheme('light') };

/** Current theme, reacts to the user's Dark/Light choice. */
export function useTheme(): Theme {
  const mode = useSettings((s) => s.themeMode);
  return cache[mode];
}
