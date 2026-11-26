import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme';

interface Props {
  label: string;
  onPress: () => void;
  /** primary = orange, secondary = filled surface, ghost = text only, danger = red text */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  icon?: ReactNode;
  compact?: boolean;
}

export function Button({ label, onPress, variant = 'primary', disabled, icon, compact }: Props) {
  const t = useTheme();
  const bg = { primary: t.colors.accent, secondary: t.colors.surfaceElevated, ghost: 'transparent', danger: 'transparent' }[variant];
  const fg = { primary: t.colors.onAccent, secondary: t.colors.text, ghost: t.colors.textMuted, danger: t.colors.negative }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        {
          height: compact ? 44 : 52,
          borderRadius: t.radius.lg,
          backgroundColor: variant === 'primary' && pressed ? t.colors.accentPressed : bg,
          opacity: disabled ? 0.4 : pressed && variant !== 'primary' ? 0.6 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        {icon}
        <Text style={{ color: fg, fontFamily: t.fonts.semibold, fontSize: t.fontSize.body }}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
