import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { Trip } from '../domain/trip';
import { useSettings } from '../state/settingsStore';
import { useTheme } from '../theme';
import { formatClock, formatDistance, formatDuration, formatSpeed } from '../utils/format';

/** One row in the trip list: time span, distance, duration and average speed. */
export function TripListItem({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const unit = useSettings((s) => s.speedUnit);
  const lang = i18n.language;
  const badge = trip.source === 'simulation' ? t('trips.simulation') : trip.source === 'manual' ? t('trips.manual') : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? theme.colors.surfaceElevated : theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          padding: theme.spacing.lg,
        },
      ]}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <View style={styles.line}>
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.body, fontWeight: '700' }}>
            {formatClock(trip.startedAt, lang)} – {formatClock(trip.endedAt, lang)}
          </Text>
          {badge ? (
            <Text
              style={[
                styles.badge,
                { color: theme.colors.accent, borderColor: theme.colors.accent, fontSize: theme.fontSize.caption },
              ]}
            >
              {badge}
            </Text>
          ) : null}
        </View>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.small }}>
          {formatDuration(trip.durationS)} · Ø {formatSpeed(trip.avgSpeedKmh, unit)}
        </Text>
      </View>
      <Text style={{ color: theme.colors.accent, fontSize: theme.fontSize.title, fontWeight: '900' }}>
        {formatDistance(trip.distanceM, unit, lang)}
      </Text>
      <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.title, marginLeft: 4 }}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, gap: 8 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1, fontWeight: '700', overflow: 'hidden' },
});
