import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  hint?: string;
}

/** Large selectable row (radio style) used in onboarding and settings. */
export function OptionRow({ label, selected, onPress, hint }: Props) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[
        styles.row,
        {
          backgroundColor: t.colors.surface,
          borderColor: selected ? t.colors.accent : t.colors.border,
          borderRadius: t.radius.md,
          padding: t.spacing.lg,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.colors.text, fontSize: t.fontSize.body, fontWeight: t.fontWeight.bold }}>{label}</Text>
        {hint ? <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.small, marginTop: 2 }}>{hint}</Text> : null}
      </View>
      <View style={[styles.radio, { borderColor: selected ? t.colors.accent : t.colors.textMuted }]}>
        {selected ? <View style={[styles.dot, { backgroundColor: t.colors.accent }]} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
