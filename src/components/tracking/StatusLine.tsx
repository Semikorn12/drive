import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme';

export type StatusTone = 'active' | 'driving' | 'off' | 'problem';

/** Coloured dot + one strong line + optional quiet detail, value on the right. */
export function StatusLine({ tone, title, detail, value }: { tone: StatusTone; title: string; detail?: string | null; value?: string | null }) {
  const theme = useTheme();
  const color =
    tone === 'driving'
      ? theme.colors.accent
      : tone === 'active'
        ? theme.colors.positive
        : tone === 'problem'
          ? theme.colors.negative
          : theme.colors.textMuted;
  return (
    <View style={styles.row}>
      <View style={[styles.halo, { backgroundColor: color + '33' }]}>
        <View style={[styles.dot, { backgroundColor: color }]} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '600' }}>{title}</Text>
        {detail ? <Text style={{ color: theme.colors.textMuted, fontSize: 14, marginTop: 2 }}>{detail}</Text> : null}
      </View>
      {value ? (
        <Text style={{ color: theme.colors.textMuted, fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{value}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  halo: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
