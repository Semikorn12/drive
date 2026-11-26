import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { tripRepository } from '../data/tripRepository';
import { manualStart, manualStop } from '../services/tracking/engine';
import { useLive } from '../services/tracking/liveStore';
import { startWebTracking, stopWebTracking, useWebTracking } from '../services/tracking/webTracker';
import { useSettings } from '../state/settingsStore';
import { useTheme } from '../theme';
import { formatDistance, formatSpeed } from '../utils/format';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Body, Title } from './ui/Typography';

/** Browser version: "Allow location" button, live status and manual start/stop. */
export function WebTrackingCard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { status, screenLock } = useWebTracking();
  const phase = useLive((s) => s.phase);
  const speed = useLive((s) => s.speedKmh);
  const dist = useLive((s) => s.tripDistanceM);
  const unit = useSettings((s) => s.speedUnit);
  const [count, setCount] = useState(0);

  useEffect(() => {
    void tripRepository.countTrips().then(setCount);
  }, [phase]);

  const running = status === 'on' || status === 'starting';
  const dot = phase === 'driving' ? theme.colors.accent : running ? theme.colors.positive : theme.colors.negative;

  return (
    <Card decoId="web">
      <Title style={{ fontSize: theme.fontSize.title }}>{t('web.title')}</Title>
      {!running ? (
        <Body muted style={{ marginTop: 6 }}>
          {t('web.text')}
        </Body>
      ) : null}

      <View style={[styles.row, { marginTop: theme.spacing.md }]}>
        <View style={[styles.dot, { backgroundColor: dot }]} />
        <Text style={{ color: theme.colors.text, fontWeight: '700', flex: 1 }}>
          {status === 'on' ? t(`web.phase.${phase}`) : t(`web.status.${status}`)}
        </Text>
      </View>
      {status === 'on' ? (
        <Body muted style={{ marginTop: 4 }}>
          {formatSpeed(speed, unit)}
          {phase === 'driving' ? ` · ${formatDistance(dist, unit)}` : ''}
          {screenLock ? ` · ${t('web.screenOn')}` : ''}
        </Body>
      ) : null}

      <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.sm }}>
        {running ? (
          <>
            <Button
              label={phase === 'driving' ? t('tracking.manualStop') : t('tracking.manualStart')}
              onPress={() => void (phase === 'driving' ? manualStop() : manualStart())}
              variant={phase === 'driving' ? 'ghost' : 'primary'}
            />
            <Button label={t('web.stop')} variant="ghost" onPress={stopWebTracking} />
          </>
        ) : (
          <Button label={t('web.start')} onPress={() => void startWebTracking()} />
        )}
      </View>

      <Body muted style={{ marginTop: theme.spacing.md, fontSize: theme.fontSize.small }}>
        🔒 {t('web.private')}
      </Body>
      <Body muted style={{ marginTop: theme.spacing.sm, fontSize: theme.fontSize.small }}>
        {t('web.limit')}
      </Body>
      <Body muted style={{ marginTop: theme.spacing.sm, fontSize: theme.fontSize.small }}>
        {t('web.trips', { count })}
      </Body>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
