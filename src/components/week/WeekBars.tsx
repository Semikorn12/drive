import { StyleSheet, Text, View } from 'react-native';

import type { DayStat } from '../../domain/stats/week';
import { useTheme } from '../../theme';

const BAR_HEIGHT = 72;

/** Seven slim columns, Monday to Sunday. Today is orange, days without trips show a short stub. */
export function WeekBars({ days, today, locale }: { days: DayStat[]; today: number; locale?: string }) {
  const theme = useTheme();
  const max = Math.max(...days.map((d) => d.distanceM), 1);
  // Nothing driven yet → a compact strip instead of a tall empty chart.
  const trackHeight = days.some((d) => d.distanceM > 0) ? BAR_HEIGHT : 3;

  return (
    <View style={styles.row} accessibilityRole="image">
      {days.map((d) => {
        const isToday = d.day === today;
        const future = d.day > today;
        const h = d.distanceM > 0 ? Math.max(6, (d.distanceM / max) * BAR_HEIGHT) : 3;
        const label = new Date(d.day).toLocaleDateString(locale, { weekday: 'narrow' });
        return (
          <View key={d.day} style={styles.col}>
            <View style={[styles.track, { height: trackHeight }]}>
              <View
                style={{
                  height: h,
                  width: d.distanceM > 0 ? '56%' : '100%',
                  alignSelf: 'center',
                  borderRadius: 4,
                  backgroundColor: isToday && d.distanceM > 0 ? theme.colors.accent : d.distanceM > 0 ? theme.colors.text : theme.colors.border,
                  opacity: future ? 0.5 : d.distanceM > 0 && !isToday ? 0.32 : 1,
                }}
              />
            </View>
            <Text
              style={{
                marginTop: 8,
                fontSize: 12,
                textAlign: 'center',
                fontWeight: isToday ? '700' : '500',
                color: isToday ? theme.colors.text : theme.colors.textMuted,
              }}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  col: { flex: 1, alignItems: 'stretch' },
  track: { justifyContent: 'flex-end' },
});
