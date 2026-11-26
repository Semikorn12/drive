import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme';

interface Props<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}

/** iOS-style segmented control (e.g. Deutsch | English). */
export function Segmented<T extends string>({ value, options, onChange }: Props<T>) {
  const t = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: t.colors.surfaceElevated, borderRadius: t.radius.md }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.seg, { borderRadius: t.radius.sm + 1, backgroundColor: active ? t.colors.background : 'transparent' }]}
          >
            <Text style={{ color: active ? t.colors.text : t.colors.textMuted, fontFamily: active ? t.fonts.semibold : t.fonts.medium, fontSize: t.fontSize.small }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', padding: 3 },
  seg: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 10 },
});
