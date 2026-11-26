import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '../../theme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  hint?: string;
  /** Row inside a grouped list (Card flush): no frame, hairline above unless first. */
  grouped?: boolean;
  divider?: boolean;
}

/** Selectable row (single choice) used in onboarding and settings. */
export function OptionRow({ label, selected, onPress, hint, grouped, divider }: Props) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? t.colors.surfaceElevated : grouped ? 'transparent' : t.colors.surface,
          borderColor: selected && !grouped ? t.colors.accent : 'transparent',
          borderRadius: grouped ? 0 : t.radius.md + 2,
          borderWidth: grouped ? 0 : 1.5,
          paddingHorizontal: t.spacing.lg,
        },
      ]}
    >
      {grouped && divider ? (
        <View style={{ position: 'absolute', top: 0, right: 0, left: t.spacing.lg, height: StyleSheet.hairlineWidth, backgroundColor: t.colors.border }} />
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.colors.text, fontSize: t.fontSize.body, fontWeight: selected ? '600' : '400' }}>{label}</Text>
        {hint ? <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.small, marginTop: 2 }}>{hint}</Text> : null}
      </View>
      {selected ? (
        <Svg width={20} height={20} viewBox="0 0 20 20">
          <Path d="M4 10.5 L8.2 14.5 L16 5.5" stroke={t.colors.accent} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52, gap: 12 },
});
