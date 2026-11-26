import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TrackingCard } from '../../components/TrackingCard';
import { WebTrackingCard } from '../../components/WebTrackingCard';
import { Screen } from '../../components/ui/Screen';
import { Body, Label, Num } from '../../components/ui/Typography';
import { WeekBars } from '../../components/week/WeekBars';
import { tripRepository } from '../../data/tripRepository';
import { kmToMiles } from '../../domain/detection/geo';
import { weekSummary, type WeekSummary } from '../../domain/stats/week';
import { useLive } from '../../services/tracking/liveStore';
import { useSettings } from '../../state/settingsStore';
import { useTheme } from '../../theme';
import { formatDuration } from '../../utils/format';

const STREAK_LOOKBACK_MS = 400 * 24 * 3600 * 1000;

/** This week at a glance: distance, a Mon–Sun strip, trips / time / streak, and the tracking control. */
export default function WeekScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const unit = useSettings((s) => s.speedUnit);
  const phase = useLive((s) => s.phase);
  const [week, setWeek] = useState<WeekSummary>(() => weekSummary([]));

  const load = useCallback(async () => {
    const trips = await tripRepository.listTrips({ since: Date.now() - STREAK_LOOKBACK_MS, limit: 5000 });
    setWeek(weekSummary(trips));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  // A trip just ended → refresh the numbers.
  useEffect(
    () =>
      useLive.subscribe((s, prev) => {
        if (prev.phase !== 'idle' && s.phase === 'idle') void load();
      }),
    [load],
  );

  const km = week.distanceM / 1000;
  const value = unit === 'mph' ? kmToMiles(km) : km;
  const lang = i18n.language;
  const tracking = Platform.OS === 'web' ? <WebTrackingCard /> : <TrackingCard />;
  const driving = phase === 'driving';

  const range = `${new Date(week.days[0].day).toLocaleDateString(lang, { day: 'numeric', month: 'short' })} – ${new Date(
    week.days[6].day,
  ).toLocaleDateString(lang, { day: 'numeric', month: 'short' })}`;

  return (
    <Screen title={t('week.title')}>
      {driving ? tracking : null}

      <View style={{ gap: theme.spacing.xl }}>
        <View>
          <Label>{range}</Label>
          <View style={styles.hero}>
            <Num size={64}>{value.toLocaleString(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</Num>
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.title, fontWeight: '600', marginLeft: 6 }}>
              {unit === 'mph' ? 'mi' : 'km'}
            </Text>
          </View>
        </View>

        <WeekBars days={week.days} today={week.today} locale={lang} />

        <View style={[styles.stats, { borderColor: theme.colors.border }]}>
          <Stat value={String(week.trips)} label={t('week.trips')} />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <Stat value={week.durationS > 0 ? formatDuration(week.durationS) : '0 min'} label={t('week.duration')} />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <Stat value={t('week.days', { count: week.streakDays })} label={t('week.streak')} />
        </View>

        {week.trips === 0 ? <Body muted>{t('week.emptyText')}</Body> : null}
      </View>

      {driving ? null : tracking}
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Num size={20}>{value}</Num>
      <Label style={{ marginTop: 2 }}>{label}</Label>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  stats: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 14 },
  stat: { flex: 1, paddingHorizontal: 2 },
  divider: { width: StyleSheet.hairlineWidth, marginHorizontal: 12 },
});
