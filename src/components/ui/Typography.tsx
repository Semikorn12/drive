import type { ReactNode } from 'react';
import { Text, type TextStyle } from 'react-native';

import { useTheme } from '../../theme';

export function Title({ children, style }: { children: ReactNode; style?: TextStyle }) {
  const t = useTheme();
  return (
    <Text style={[{ color: t.colors.text, fontSize: t.fontSize.headline, fontWeight: '700', letterSpacing: -0.4 }, style]}>
      {children}
    </Text>
  );
}

export function Body({ children, muted, style }: { children: ReactNode; muted?: boolean; style?: TextStyle }) {
  const t = useTheme();
  return (
    <Text
      style={[
        { color: muted ? t.colors.textMuted : t.colors.text, fontSize: t.fontSize.body, lineHeight: t.fontSize.body * t.lineHeight.normal },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/** Small muted caption above a value or section. Sentence case, no shouting. */
export function Label({ children, style }: { children: ReactNode; style?: TextStyle }) {
  const t = useTheme();
  return <Text style={[{ color: t.colors.textMuted, fontSize: 13, fontWeight: '500' }, style]}>{children}</Text>;
}

/** Numbers: fixed-width digits so values don't jump while they change. */
export function Num({ children, size, color, style }: { children: ReactNode; size?: number; color?: string; style?: TextStyle }) {
  const t = useTheme();
  return (
    <Text
      style={[
        {
          color: color ?? t.colors.text,
          fontSize: size ?? t.fontSize.title,
          fontWeight: '700',
          fontVariant: ['tabular-nums'],
          letterSpacing: (size ?? 20) >= 40 ? -1.5 : -0.3,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
