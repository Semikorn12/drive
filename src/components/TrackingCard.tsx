import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { readPermissions } from '../services/permissions';
import { manualStart, manualStop } from '../services/tracking/engine';
import { useLive } from '../services/tracking/liveStore';
import { useSettings } from '../state/settingsStore';
import { useTheme } from '../theme';
import { formatDistance, formatSpeed } from '../utils/format';
import { StatusDot } from './StatusDot';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Icon } from './ui/Icon';
import { Caption, Heading, Label } from './ui/Typography';

/**
 * Detection status + the always-available manual Start/Stop
 * (backup, because iOS can't reliably tell us about car Bluetooth/CarPlay).
 */
export function TrackingCard() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const phase = useLive((s) => s.phase);
  const dist = useLive((s) => s.tripDistanceM);
  const speed = useLive((s) => s.speedKmh);
  const sim = useLive((s) => s.simulation.running);
  const unit = useSettings((s) => s.speedUnit);
  const [autoOn, setAutoOn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void readPermissions().then((p) => setAutoOn(p.locationBackground === 'granted'));
    }, []),
  );

  const driving = phase === 'driving';
  const status = driving
    ? t('tracking.statusDriving')
    : phase === 'candidate'
      ? t('tracking.statusCandidate')
      : autoOn === false
        ? t('tracking.statusOff')
        : t('tracking.statusIdle');
  const detail = driving
    ? `${formatSpeed(speed, unit)} · ${formatDistance(dist, unit, i18n.language)}`
    : sim
      ? t('tracking.simulationBadge')
      : autoOn === false
        ? t('tracking.statusOffHint')
        : t('tracking.idleHint');
  const color = driving ? theme.colors.accent : autoOn === false ? theme.colors.negative : theme.colors.positive;

  const toggle = async () => {
    setBusy(true);
    try {
      await (driving ? manualStop() : manualStart());
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <Label>{t('tracking.panelTitle')}</Label>
      <View style={[styles.row, { marginTop: 10 }]}>
        <StatusDot color={color} pulse={driving || (autoOn !== false && phase !== 'idle')} />
        <Heading style={{ flex: 1 }}>{status}</Heading>
      </View>
      <Caption style={{ marginTop: 4, marginLeft: 20 }}>{detail}</Caption>
      <View style={{ marginTop: theme.spacing.lg }}>
        <Button
          label={driving ? t('tracking.manualStop') : t('tracking.manualStart')}
          onPress={toggle}
          disabled={busy || sim}
          variant={driving ? 'secondary' : 'primary'}
          icon={<Icon name={driving ? 'stop' : 'play'} size={14} color={driving ? theme.colors.text : theme.colors.onAccent} />}
        />
      </View>
      {!driving ? <Caption style={{ marginTop: 10, textAlign: 'center', color: theme.colors.textFaint }}>{t('tracking.manualHint')}</Caption> : null}
    </Card>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 12 } });
