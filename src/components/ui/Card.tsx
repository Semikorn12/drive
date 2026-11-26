import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme';

interface Props {
  children: ReactNode;
  /** Kept for compatibility – cards no longer draw decoration. */
  decoId?: string;
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
}

/** Calm surface: no borders in dark mode, a hairline in light mode. */
export function Card({ children, style, padded = true }: Props) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: t.colors.surface,
          borderRadius: t.radius.xl,
          padding: padded ? t.spacing.lg + 2 : 0,
          borderColor: t.colors.border,
        },
        style as ViewStyle,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ card: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth } });
