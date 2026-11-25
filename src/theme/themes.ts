import { palette } from './tokens';

export type ThemeMode = 'dark' | 'light';

/** Semantic colours. Screens use these names, never raw palette values. */
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  accent: string;
  accentPressed: string;
  onAccent: string;
  decoFrom: string;
  decoTo: string;
  decoOpacity: number;
  positive: string;
  negative: string;
  tabBar: string;
  tabInactive: string;
}

export const darkColors: ThemeColors = {
  background: palette.navy950,
  surface: palette.navy900,
  surfaceElevated: palette.navy800,
  border: palette.navy700,
  text: palette.white,
  textMuted: palette.gray300,
  primary: palette.navy900,
  accent: palette.orange500,
  accentPressed: palette.orange600,
  onAccent: palette.navy950,
  decoFrom: palette.purple500,
  decoTo: palette.purple300,
  decoOpacity: 0.35,
  positive: palette.green500,
  negative: palette.red500,
  tabBar: palette.navy950,
  tabInactive: palette.gray500,
};

export const lightColors: ThemeColors = {
  background: palette.navy50,
  surface: palette.white,
  surfaceElevated: palette.navy100,
  border: palette.gray100,
  text: palette.navy950,
  textMuted: palette.gray700,
  primary: palette.navy900,
  accent: palette.orange500,
  accentPressed: palette.orange600,
  onAccent: palette.navy950,
  decoFrom: palette.purple500,
  decoTo: palette.purple300,
  decoOpacity: 0.18,
  positive: '#159E63',
  negative: '#D92B4A',
  tabBar: palette.white,
  tabInactive: palette.gray500,
};

export const themes: Record<ThemeMode, ThemeColors> = {
  dark: darkColors,
  light: lightColors,
};
