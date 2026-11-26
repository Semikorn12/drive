import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme';

interface Props {
  children: ReactNode;
  /** Kept for compatibility; cards no longer draw decorative curves. */
  decoId?: string;
  style?: ViewStyle;
  /** No inner padding (for lists with their own row padding). */
  flush?: boolean;
}

/** Plain surface block. No border, no ornaments – content carries the design. */
export function Card({ children, style, flush }: Props) {
  const t = useTheme();
  return (
    <View
      style={[
        { backgroundColor: t.colors.surface, borderRadius: t.radius.lg, padding: flush ? 0 : t.spacing.lg, overflow: 'hidden' },
        style,
      ]}
    >
      {children}
    </View>
  );
}
