import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '../../theme';

interface Props {
  label: string;
  onPress: () => void;
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
          borderRadius: t.radius.pill,
          paddingVertical: t.spacing.md + 2,
          backgroundColor: primary ? (pressed ? t.colors.accentPressed : t.colors.accent) : 'transparent',
          borderColor: primary ? 'transparent' : t.colors.border,
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      <Text
        style={{
          color: primary ? t.colors.onAccent : t.colors.text,
          fontSize: t.fontSize.body,
          fontWeight: t.fontWeight.bold,
          letterSpacing: 0.4,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, paddingHorizontal: 24 },
});
