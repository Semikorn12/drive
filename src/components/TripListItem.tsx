import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import type { Trip } from '../domain/trip';
import { useSettings } from '../state/settingsStore';
import { useTheme } from '../theme';
import { formatClock, formatDistance, formatDuration, formatSpeed } from '../utils/format';

/** One row in a grouped trip list. `divider` draws the hairline above it. */
export function TripListItem({ trip, onPress, divider }: { trip: Trip; onPress: () => void; divider?: boolean }) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const unit = useSettings((s) => s.speedUnit);
  const lang = i18n.language;
  const tag = trip.source === 'simulation' ? t('trips.simulation') : trip.source === 'manual' ? t('trips.manual') : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? theme.colors.surfaceElevated : 'transparent' }]}
    >
      {divider ? <View style={[styles.divider, { backgroundColor: theme.colors.border, left: theme.spacing.lg }]} /> : null}
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
          {formatClock(trip.startedAt, lang)}
          <Text style={{ color: theme.colors.textMuted, fontWeight: '400' }}> – {formatClock(trip.endedAt, lang)}</Text>
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
          {formatDuration(trip.durationS)} · Ø {formatSpeed(trip.avgSpeedKmh, unit)}
          {tag ? ` · ${tag}` : ''}
        </Text>
      </View>
      <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
        {formatDistance(trip.distanceM, unit, lang)}
      </Text>
      <Svg width={8} height={14} viewBox="0 0 8 14" style={{ marginLeft: 10 }}>
        <Path d="M1.5 1.5 L6.5 7 L1.5 12.5" stroke={theme.colors.textMuted} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, minHeight: 64 },
  divider: { position: 'absolute', top: 0, right: 0, height: StyleSheet.hairlineWidth },
});
