import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { RouteMap } from '../../components/trip/RouteMap';
import { SpeedChart } from '../../components/trip/SpeedChart';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Body, Label } from '../../components/ui/Typography';
import { tripRepository } from '../../data/tripRepository';
import type { LocationSample } from '../../domain/detection/types';
import type { Trip } from '../../domain/trip';
import { useSettings } from '../../state/settingsStore';
import { useTheme } from '../../theme';
import { relativeDay, startOfDay } from '../../utils/days';
import { confirmDestructive } from '../../utils/confirm';
import { formatClock, formatDay, formatDistance, formatDuration, formatSpeed } from '../../utils/format';

/** Trip detail: route sketch, key numbers and the speed chart. */
export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const unit = useSettings((s) => s.speedUnit);
  const lang = i18n.language;
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
  const [points, setPoints] = useState<LocationSample[]>([]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [tr, pts] = await Promise.all([tripRepository.getTrip(id), tripRepository.getPoints(id)]);
      if (!alive) return;
      setTrip(tr);
      setPoints(pts);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/trips'));

  const remove = async () => {
    const ok = await confirmDestructive({
      title: t('trip.deleteTitle'),
      text: t('trip.deleteText'),
      confirm: t('trip.deleteConfirm'),
      cancel: t('trip.cancel'),
    });
    if (!ok) return;
    await tripRepository.deleteTrip(id);
    back();
  };

  if (trip === undefined) return <Screen title={t('trip.title')} onBack={back}>{null}</Screen>;
  if (trip === null) {
    return (
      <Screen title={t('trip.title')} onBack={back}>
        <Card>
          <Body muted>{t('trip.notFound')}</Body>
        </Card>
      </Screen>
    );
  }

  const rel = relativeDay(startOfDay(trip.startedAt));
  const title = rel ? t(`trips.${rel}`) : formatDay(trip.startedAt, lang);
  const stats = [
    { key: 'distance', value: formatDistance(trip.distanceM, unit, lang) },
    { key: 'duration', value: formatDuration(trip.durationS) },
    { key: 'avgSpeed', value: formatSpeed(trip.avgSpeedKmh, unit) },
    { key: 'maxSpeed', value: formatSpeed(trip.maxSpeedKmh, unit) },
  ];

  return (
    <Screen title={title} onBack={back}>
      <Card>
        <View style={styles.times}>
          <Endpoint color={theme.colors.positive} label={t('trip.start')} time={formatClock(trip.startedAt, lang)} />
          <View style={[styles.dash, { borderColor: theme.colors.border }]} />
          <Endpoint color={theme.colors.accent} label={t('trip.end')} time={formatClock(trip.endedAt, lang)} />
        </View>
        <View style={{ marginTop: theme.spacing.md }}>
          {points.length > 0 ? <RouteMap points={points} /> : <Body muted>{t('trip.noRoute')}</Body>}
        </View>
        <Body muted style={{ marginTop: theme.spacing.sm, fontSize: theme.fontSize.caption }}>
          🔒 {t('trip.privacy')}
        </Body>
      </Card>

      <View style={styles.grid}>
        {stats.map((s) => (
          <Card key={s.key} style={styles.tile}>
            <Label>{t(`trip.${s.key}`)}</Label>
            <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.title, fontWeight: '900', marginTop: 4 }}>{s.value}</Text>
          </Card>
        ))}
      </View>

      {points.length > 1 ? (
        <Card>
          <Label>{t('trip.speedChart')}</Label>
          <View style={{ marginTop: theme.spacing.md }}>
            <SpeedChart points={points} unit={unit} />
          </View>
        </Card>
      ) : null}

      <Pressable onPress={() => void remove()} accessibilityRole="button" style={{ alignSelf: 'center', padding: theme.spacing.md }}>
        <Text style={{ color: theme.colors.negative, fontWeight: '700', fontSize: theme.fontSize.body }}>{t('trip.delete')}</Text>
      </Pressable>
    </Screen>
  );
}

function Endpoint({ color, label, time }: { color: string; label: string; time: string }) {
  const theme = useTheme();
  return (
    <View style={styles.endpoint}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View>
        <Label>{label}</Label>
        <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.title, fontWeight: '800' }}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  times: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  endpoint: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dash: { flex: 1, borderTopWidth: 2, borderStyle: 'dashed', marginTop: 12 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { flexBasis: '47%', flexGrow: 1 },
});
