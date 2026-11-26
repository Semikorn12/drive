import { Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TrackingCard } from '../../components/TrackingCard';
import { WebTrackingCard } from '../../components/WebTrackingCard';
import { Card } from '../../components/ui/Card';
import { ListGroup, ListRow } from '../../components/ui/List';
import { Screen } from '../../components/ui/Screen';
import { Caption, Label, Metric } from '../../components/ui/Typography';
import { useWeekStats } from '../../hooks/useWeekStats';
import { kmToMiles } from '../../domain/detection/geo';
import { useSettings } from '../../state/settingsStore';
import { useTheme } from '../../theme';
import { formatDistance, formatDuration } from '../../utils/format';

/** Week overview – dashboard style. */
export default function WeekScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const unit = useSettings((s) => s.speedUnit);
  const stats = useWeekStats();
  const lng = i18n.language;

  const km = (stats?.distanceM ?? 0) / 1000;
  const shown = unit === 'mph' ? kmToMiles(km) : km;
  const diffM = (stats?.distanceM ?? 0) - (stats?.prevDistanceM ?? 0);
  const hasPrev = (stats?.prevDistanceM ?? 0) > 0;

  const start = stats ? new Date(stats.weekStart) : new Date();
  const end = new Date(start.getTime() + 6 * 86_400_000);
  const range = `${start.toLocaleDateString(lng, { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString(lng, { day: 'numeric', month: 'short' })}`;

  const durH = Math.floor((stats?.durationS ?? 0) / 3600);
  const durM = Math.round(((stats?.durationS ?? 0) % 3600) / 60);

  return (
    <Screen title={t('week.title')} subtitle={range}>
      <Card>
        <Label>{t('week.distanceLabel')}</Label>
        <View style={{ marginTop: 6 }}>
          <Metric
            size="hero"
            value={shown.toLocaleString(lng, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            unit={unit === 'mph' ? 'mi' : 'km'}
          />
        </View>
        <Caption style={{ marginTop: 2, color: hasPrev ? (diffM >= 0 ? theme.colors.positive : theme.colors.negative) : theme.colors.textFaint }}>
          {hasPrev
            ? t('week.vsLastWeek', { value: `${diffM >= 0 ? '+' : '−'}${formatDistance(Math.abs(diffM), unit, lng)}` })
            : t('week.firstWeek')}
        </Caption>

        <View style={[styles.stats, { borderTopColor: theme.colors.separator }]}>
          <Stat label={t('week.trips')} value={String(stats?.trips ?? 0)} />
          <View style={[styles.vline, { backgroundColor: theme.colors.separator }]} />
          <Stat label={t('week.duration')} value={`${durH}:${String(durM).padStart(2, '0')}`} unit="h" />
          <View style={[styles.vline, { backgroundColor: theme.colors.separator }]} />
          <Stat label={t('week.streak')} value={String(stats?.streakDays ?? 0)} unit={t('week.days')} />
        </View>
      </Card>

      {Platform.OS === 'web' ? <WebTrackingCard /> : <TrackingCard />}

      <ListGroup title={t('week.lastTrip')}>
        {stats?.lastTrip ? (
          <ListRow
            label={new Date(stats.lastTrip.startedAt).toLocaleString(lng, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            value={`${formatDistance(stats.lastTrip.distanceM, unit, lng)} · ${formatDuration(stats.lastTrip.durationS)}`}
          />
        ) : (
          <ListRow label={t('week.noTrips')} disabled />
        )}
      </ListGroup>
    </Screen>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <View style={styles.stat}>
      <Label>{label}</Label>
      <View style={{ marginTop: 4 }}>
        <Metric size="title" value={value} unit={unit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', marginTop: 20, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth },
  stat: { flex: 1 },
  vline: { width: StyleSheet.hairlineWidth, marginHorizontal: 12 },
});
