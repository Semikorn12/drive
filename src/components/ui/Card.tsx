import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme';
import { DecoCurves } from './DecoCurves';

interface Props {
  children: ReactNode;
  /** Pass an id to show the decorative purple curves. */
  decoId?: string;
  style?: ViewStyle;
}

export function Card({ children, decoId, style }: Props) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.colors.surface, borderColor: t.colors.border, borderRadius: t.radius.lg, padding: t.spacing.lg },
        style,
      ]}
    >
      {decoId ? <DecoCurves id={decoId} /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ card: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth } });
