import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { readPermissions } from '../services/permissions';
import { manualStart, manualStop } from '../services/tracking/engine';
import { useLive } from '../services/tracking/liveStore';
import { useTheme } from '../theme';
import { StatusLine } from './tracking/StatusLine';
import { LiveGauge } from './trip/LiveGauge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

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

  const driving = phase === 'driving';
  const toggle = async () => {
    setBusy(true);
    try {
      await (driving ? manualStop() : manualStart());
    } finally {
      setBusy(false);
    }
  };

  const title =
    phase === 'candidate' ? t('tracking.statusCandidate') : autoOn === false ? t('tracking.statusOff') : t('tracking.statusIdle');
  const detail = sim ? t('tracking.simulationBadge') : autoOn === false ? t('tracking.statusOffHint') : null;

  return (
    <Card style={{ gap: theme.spacing.lg }}>
      {driving ? (
        <LiveGauge />
      ) : (
        <StatusLine tone={autoOn === false ? 'off' : phase === 'candidate' ? 'driving' : 'active'} title={title} detail={detail} />
      )}
      <Button
        label={driving ? t('tracking.manualStop') : t('tracking.manualStart')}
        onPress={toggle}
        disabled={busy || sim}
        variant={driving ? 'ghost' : 'primary'}
      />
      {driving ? null : <Text style={{ color: theme.colors.textMuted, fontSize: 13, lineHeight: 18 }}>{t('tracking.manualHint')}</Text>}
    </Card>
  );
}
