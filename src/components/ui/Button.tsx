import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '../../theme';

interface Props {
  label: string;
  onPress: () => void;
  /** primary = orange, ghost = quiet grey surface */
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
}

export function Button({ label, onPress, variant = 'primary', disabled }: Props) {
  const t = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        {
          borderRadius: t.radius.md + 2,
          backgroundColor: primary
            ? pressed
              ? t.colors.accentPressed
              : t.colors.accent
            : pressed
              ? t.colors.border
              : t.colors.surfaceElevated,
          opacity: disabled ? 0.4 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      <Text style={{ color: primary ? t.colors.onAccent : t.colors.text, fontSize: t.fontSize.body, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', minHeight: 52, paddingHorizontal: 20 },
});
