import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AdBanner } from '../../components/AdBanner';
import { TripListItem } from '../../components/TripListItem';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Body, Label } from '../../components/ui/Typography';
import { tripRepository } from '../../data/tripRepository';
import type { Trip } from '../../domain/trip';
import { useSettings } from '../../state/settingsStore';
import { useTheme } from '../../theme';
import { groupByDay, relativeDay } from '../../utils/days';
import { formatDay, formatDistance } from '../../utils/format';

const PAGE = 50;

/** All completed trips, newest first, grouped by day. */
export default function TripsScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const unit = useSettings((s) => s.speedUnit);
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [total, setTotal] = useState(0);

  const load = useCallback(async (count: number) => {
    const [list, n] = await Promise.all([tripRepository.listTrips({ limit: count }), tripRepository.countTrips()]);
    setTrips(list);
    setTotal(n);
  }, []);

  // Reload whenever the tab comes into view (a trip may have just ended or been deleted).
  useFocusEffect(
    useCallback(() => {
      void load(PAGE);
    }, [load]),
  );

  const dayLabel = (day: number) => {
    const rel = relativeDay(day);
    return rel ? t(`trips.${rel}`) : formatDay(day, i18n.language);
  };

  return (
    <Screen title={t('trips.title')}>
      {trips && trips.length === 0 ? (
        <Card>
          <Body muted>{t('trips.empty')}</Body>
        </Card>
      ) : null}

      {trips
        ? groupByDay(trips, (x) => x.startedAt).map((g) => {
            const km = g.items.reduce((s, x) => s + x.distanceM, 0);
            return (
              <View key={g.day} style={{ gap: theme.spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
                  <Label>{dayLabel(g.day)}</Label>
                  <Label>
                    {t('trips.count', { count: g.items.length })} · {formatDistance(km, unit, i18n.language)}
                  </Label>
                </View>
                {g.items.map((trip) => (
                  <TripListItem key={trip.id} trip={trip} onPress={() => router.push(`/trip/${trip.id}`)} />
                ))}
              </View>
            );
          })
        : null}

      {trips && trips.length < total ? (
        <Button label={t('trips.loadMore')} variant="ghost" onPress={() => void load(trips.length + PAGE)} />
      ) : null}

      <AdBanner placement="tripList" />
    </Screen>
  );
}
