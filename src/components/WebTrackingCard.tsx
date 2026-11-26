import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { manualStart, manualStop } from '../services/tracking/engine';
import { useLive } from '../services/tracking/liveStore';
import { startWebTracking, stopWebTracking, useWebTracking } from '../services/tracking/webTracker';
import { useSettings } from '../state/settingsStore';
import { useTheme } from '../theme';
import { formatDistance, formatSpeed } from '../utils/format';
import { StatusDot } from './StatusDot';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Icon } from './ui/Icon';
import { Caption, Heading, Label } from './ui/Typography';

/** Browser version: "Allow location", live status and manual start/stop. */
export function WebTrackingCard() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { status } = useWebTracking();
  const phase = useLive((s) => s.phase);
  const speed = useLive((s) => s.speedKmh);
  const dist = useLive((s) => s.tripDistanceM);
  const unit = useSettings((s) => s.speedUnit);

  const on = status === 'on';
  const running = on || status === 'starting';
  const driving = on && phase === 'driving';
  const color = driving ? theme.colors.accent : running ? theme.colors.positive : status === 'off' ? theme.colors.textFaint : theme.colors.negative;
  const title = on ? t(`web.phase.${phase}`) : t(`web.status.${status}`);
  const detail = driving
    ? `${formatSpeed(speed, unit)} · ${formatDistance(dist, unit, i18n.language)}`
    : on
      ? speed != null && speed >= 1
        ? `${formatSpeed(speed, unit)} · ${t('web.screenOn')}`
        : t('web.screenOn')
      : status === 'denied'
        ? t('web.deniedHint')
        : running
          ? t('web.limit')
          : t('web.text');

  return (
    <Card>
      <Label>{t('web.title')}</Label>
      <View style={[styles.row, { marginTop: 10 }]}>
        <StatusDot color={color} pulse={running} />
        <Heading style={{ flex: 1 }}>{title}</Heading>
      </View>
      <Caption style={{ marginTop: 4, marginLeft: 20 }}>{detail}</Caption>

      <View style={[styles.buttons, { marginTop: theme.spacing.lg }]}>
        {running ? (
          <>
            <Button
              label={driving ? t('tracking.manualStop') : t('tracking.manualStart')}
              onPress={() => void (driving ? manualStop() : manualStart())}
              variant={driving ? 'secondary' : 'primary'}
              icon={<Icon name={driving ? 'stop' : 'play'} size={14} color={driving ? theme.colors.text : theme.colors.onAccent} />}
            />
          </>
        ) : (
          <Button label={t('web.start')} onPress={() => void startWebTracking()} icon={<Icon name="pin" size={16} color={theme.colors.onAccent} />} />
        )}
      </View>

      {running ? (
        <View style={{ marginTop: 4 }}>
          <Button label={t('web.stop')} variant="ghost" compact onPress={stopWebTracking} />
        </View>
      ) : null}

      <View style={[styles.note, { borderTopColor: theme.colors.separator }]}>
        <Icon name="lock" size={15} color={theme.colors.textFaint} />
        <Caption style={{ flex: 1, color: theme.colors.textFaint }}>{t('web.private')}</Caption>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  buttons: { flexDirection: 'row', gap: 10 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth },
});
