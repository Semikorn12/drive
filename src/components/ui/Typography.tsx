import type { ReactNode } from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '../../theme';

type P = { children: ReactNode; style?: TextStyle | TextStyle[]; numberOfLines?: number } & Pick<TextProps, 'accessibilityRole'>;

/** Large screen title (condensed display font). */
export function Title({ children, style, ...rest }: P) {
  const t = useTheme();
  return (
    <Text
      {...rest}
      style={[{ color: t.colors.text, fontFamily: t.fonts.display, fontSize: t.fontSize.headline, letterSpacing: 0.2 }, style as TextStyle]}
    >
      {children}
    </Text>
  );
}

/** Section / card heading. */
export function Heading({ children, style, ...rest }: P) {
  const t = useTheme();
  return (
    <Text {...rest} style={[{ color: t.colors.text, fontFamily: t.fonts.semibold, fontSize: t.fontSize.heading }, style as TextStyle]}>
      {children}
    </Text>
  );
}

export function Body({ children, muted, style, ...rest }: P & { muted?: boolean }) {
  const t = useTheme();
  return (
    <Text
      {...rest}
      style={[
        {
          color: muted ? t.colors.textMuted : t.colors.text,
          fontFamily: t.fonts.regular,
          fontSize: t.fontSize.body,
          lineHeight: Math.round(t.fontSize.body * t.lineHeight.normal),
        },
        style as TextStyle,
      ]}
    >
      {children}
    </Text>
  );
}

export function Caption({ children, style, ...rest }: P) {
  const t = useTheme();
  return (
    <Text
      {...rest}
      style={[{ color: t.colors.textMuted, fontFamily: t.fonts.regular, fontSize: t.fontSize.caption, lineHeight: 17 }, style as TextStyle]}
    >
      {children}
    </Text>
  );
}

/** Small uppercase label above numbers / sections. */
export function Label({ children, style }: P) {
  const t = useTheme();
  return (
    <Text
      style={[
        {
          color: t.colors.textMuted,
          fontFamily: t.fonts.semibold,
          fontSize: t.fontSize.overline,
          letterSpacing: 1.1,
          textTransform: 'uppercase',
        },
        style as TextStyle,
      ]}
    >
      {children}
    </Text>
  );
}

/** Big instrument-style number with a small unit. Tabular digits so values don't jump. */
export function Metric({ value, unit, size = 'display', color }: { value: string; unit?: string; size?: 'display' | 'hero' | 'title'; color?: string }) {
  const t = useTheme();
  const fs = size === 'hero' ? t.fontSize.hero : size === 'display' ? t.fontSize.display : 30;
  return (
    <Text
      style={{
        color: color ?? t.colors.text,
        fontFamily: t.fonts.display,
        fontSize: fs,
        lineHeight: Math.round(fs * 1.05),
        fontVariant: ['tabular-nums'],
      }}
    >
      {value}
      {unit ? (
        <Text style={{ fontFamily: t.fonts.medium, fontSize: Math.round(fs * 0.3), color: t.colors.textMuted }}> {unit}</Text>
      ) : null}
    </Text>
  );
}
