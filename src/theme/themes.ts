import { palette } from './tokens';

export type ThemeMode = 'dark' | 'light';

/** Semantic colours. Screens use these names, never raw palette values. */
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  separator: string;
  text: string;
  textMuted: string;
  textFaint: string;
  primary: string;
  accent: string;
  accentPressed: string;
  accentSoft: string;
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
  surface: palette.navySurface,
  surfaceElevated: palette.navySurface2,
  border: 'rgba(255,255,255,0.06)',
  separator: 'rgba(255,255,255,0.08)',
  text: palette.snow,
  textMuted: '#8D96B5',
  textFaint: '#5B6488',
  primary: palette.navy900,
  accent: palette.orange500,
  accentPressed: palette.orange600,
  accentSoft: 'rgba(255,138,42,0.14)',
  onAccent: palette.navy950,
  decoFrom: palette.purple500,
  decoTo: palette.purple300,
  decoOpacity: 0.22,
  positive: palette.green500,
  negative: palette.red500,
  tabBar: palette.navy950,
  tabInactive: '#5B6488',
};

export const lightColors: ThemeColors = {
  background: '#F3F4F8',
  surface: palette.white,
  surfaceElevated: '#EBEDF4',
  border: 'rgba(11,20,48,0.06)',
  separator: 'rgba(11,20,48,0.08)',
  text: palette.ink,
  textMuted: '#5B6488',
  textFaint: '#9AA1BA',
  primary: palette.navy900,
  accent: palette.orange500,
  accentPressed: palette.orange600,
  accentSoft: 'rgba(255,138,42,0.14)',
  onAccent: palette.navy950,
  decoFrom: palette.purple500,
  decoTo: palette.purple300,
  decoOpacity: 0.12,
  positive: '#139A5E',
  negative: '#D92B4A',
  tabBar: '#F3F4F8',
  tabInactive: '#9AA1BA',
};

export const themes: Record<ThemeMode, ThemeColors> = {
  dark: darkColors,
  light: lightColors,
};
