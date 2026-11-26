import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { readPermissions } from '../services/permissions';
import { manualStart, manualStop } from '../services/tracking/engine';
import { useLive } from '../services/tracking/liveStore';
import { useTheme } from '../theme';
import { LiveGauge } from './trip/LiveGauge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Body } from './ui/Typography';

/**
 * Detection status + the always-visible manual Start/Stop button
 * (backup, because iOS can't reliably tell us about car Bluetooth/CarPlay).
 */
export function TrackingCard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const phase = useLive((s) => s.phase);
  const sim = useLive((s) => s.simulation.running);
  const [autoOn, setAutoOn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void readPermissions().then((p) => setAutoOn(p.locationBackground === 'granted'));
    }, []),
  );

  const status =
    phase === 'driving'
      ? t('tracking.statusDriving')
      : phase === 'candidate'
        ? t('tracking.statusCandidate')
        : autoOn === false
          ? t('tracking.statusOff')
          : t('tracking.statusIdle');
  const dot = phase === 'driving' ? theme.colors.accent : autoOn === false ? theme.colors.negative : theme.colors.positive;

  const toggle = async () => {
    setBusy(true);
    try {
      await (phase === 'driving' ? manualStop() : manualStart());
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: dot }]} />
        <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: theme.fontSize.body, flex: 1 }}>{status}</Text>
      </View>
      {phase === 'driving' ? (
        <View style={{ marginTop: theme.spacing.md }}>
          <LiveGauge />
        </View>
      ) : null}
      {sim ? <Body muted style={{ marginTop: 4 }}>{t('tracking.simulationBadge')}</Body> : null}
      {autoOn === false && phase === 'idle' ? (
        <Body muted style={{ marginTop: 6 }}>
          {t('tracking.statusOffHint')}
        </Body>
      ) : null}
      <View style={{ marginTop: theme.spacing.md }}>
        <Button
          label={phase === 'driving' ? t('tracking.manualStop') : t('tracking.manualStart')}
          onPress={toggle}
          disabled={busy || sim}
          variant={phase === 'driving' ? 'ghost' : 'primary'}
        />
      </View>
      {phase !== 'driving' ? (
        <Body muted style={{ marginTop: theme.spacing.sm, fontSize: theme.fontSize.caption }}>
          {t('tracking.manualHint')}
        </Body>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
