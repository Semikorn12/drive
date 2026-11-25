import type { ReactNode } from 'react';
import { Text, type TextStyle } from 'react-native';

import { useTheme } from '../../theme';

export function Title({ children, style }: { children: ReactNode; style?: TextStyle }) {
  const t = useTheme();
  return <Text style={[{ color: t.colors.text, fontSize: t.fontSize.headline, fontWeight: '800' }, style]}>{children}</Text>;
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

export function Label({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.caption, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' }}>
      {children}
    </Text>
  );
}
