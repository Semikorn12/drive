import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { RouteMap } from '../../components/trip/RouteMap';
import { SpeedChart } from '../../components/trip/SpeedChart';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Body, Label, Num } from '../../components/ui/Typography';
import { tripRepository } from '../../data/tripRepository';
import type { LocationSample } from '../../domain/detection/types';
import type { Trip } from '../../domain/trip';
import { useSettings } from '../../state/settingsStore';
import { useTheme } from '../../theme';
import { relativeDay, startOfDay } from '../../utils/days';
import { confirmDestructive } from '../../utils/confirm';
import { formatClock, formatDay, formatDuration, formatSpeed } from '../../utils/format';

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
  const km = trip.distanceM / 1000;
  const distValue = (unit === 'mph' ? km * 0.621371 : km).toLocaleString(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <Screen title={title} onBack={back}>
      <View>
        <View style={styles.hero}>
          <Num size={56}>{distValue}</Num>
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.title, fontWeight: '600', marginLeft: 6 }}>
            {unit === 'mph' ? 'mi' : 'km'}
          </Text>
        </View>
        <Text style={{ color: theme.colors.textMuted, fontSize: 15, fontVariant: ['tabular-nums'] }}>
          {formatClock(trip.startedAt, lang)} – {formatClock(trip.endedAt, lang)} · {formatDuration(trip.durationS)}
          {trip.source === 'simulation' ? ` · ${t('trips.simulation')}` : trip.source === 'manual' ? ` · ${t('trips.manual')}` : ''}
        </Text>
      </View>

      {points.length > 0 ? <RouteMap points={points} /> : <Body muted>{t('trip.noRoute')}</Body>}

      <View style={[styles.stats, { borderColor: theme.colors.border }]}>
        <Stat label={t('trip.avgSpeed')} value={formatSpeed(trip.avgSpeedKmh, unit)} />
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <Stat label={t('trip.maxSpeed')} value={formatSpeed(trip.maxSpeedKmh, unit)} />
      </View>

      {points.length > 1 ? (
        <View style={{ gap: theme.spacing.md }}>
          <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>{t('trip.speedChart')}</Text>
          <SpeedChart points={points} unit={unit} />
        </View>
      ) : null}

      <Label style={{ textAlign: 'center' }}>{t('trip.privacy')}</Label>

      <Pressable onPress={() => void remove()} accessibilityRole="button" style={{ alignSelf: 'center', padding: theme.spacing.md }}>
        <Text style={{ color: theme.colors.negative, fontWeight: '600', fontSize: theme.fontSize.body }}>{t('trip.delete')}</Text>
      </Pressable>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Num size={22}>{value}</Num>
      <Label style={{ marginTop: 2 }}>{label}</Label>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'baseline' },
  stats: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 14 },
  divider: { width: StyleSheet.hairlineWidth, marginHorizontal: 16 },
});
