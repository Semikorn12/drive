import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme';
import { Icon } from './Icon';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  hint?: string;
}

/** Large selectable row used in onboarding and the diagnostics page. */
export function OptionRow({ label, selected, onPress, hint }: Props) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: t.colors.surface,
          borderColor: selected ? t.colors.accent : t.colors.border,
          borderRadius: t.radius.lg,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.colors.text, fontFamily: t.fonts.medium, fontSize: t.fontSize.body }}>{label}</Text>
        {hint ? <Text style={{ color: t.colors.textMuted, fontFamily: t.fonts.regular, fontSize: t.fontSize.small, marginTop: 2 }}>{hint}</Text> : null}
      </View>
      <View style={[styles.check, { backgroundColor: selected ? t.colors.accent : 'transparent', borderColor: selected ? t.colors.accent : t.colors.textFaint }]}>
        {selected ? <Icon name="check" size={14} color={t.colors.onAccent} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 15 },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
