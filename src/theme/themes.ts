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
  background: palette.ink950,
  surface: palette.ink900,
  surfaceElevated: palette.ink850,
  border: palette.ink800,
  text: '#F3F4F6',
  textMuted: palette.ink400,
  primary: palette.navy900,
  accent: palette.orange500,
  accentPressed: palette.orange600,
  onAccent: '#140A02',
  decoFrom: palette.purple500,
  decoTo: palette.purple300,
  decoOpacity: 0,
  positive: '#3DD68C',
  negative: '#FF5D63',
  tabBar: palette.ink950,
  tabInactive: palette.ink500,
};

export const lightColors: ThemeColors = {
  background: palette.paper50,
  surface: palette.white,
  surfaceElevated: palette.paper100,
  border: palette.paper200,
  text: '#0B0D12',
  textMuted: palette.paper600,
  primary: palette.navy900,
  accent: '#F27A12',
  accentPressed: palette.orange600,
  onAccent: '#140A02',
  decoFrom: palette.purple500,
  decoTo: palette.purple300,
  decoOpacity: 0,
  positive: '#159E63',
  negative: '#D92B4A',
  tabBar: palette.white,
  tabInactive: '#9AA0AD',
};

export const themes: Record<ThemeMode, ThemeColors> = {
  dark: darkColors,
  light: lightColors,
};
