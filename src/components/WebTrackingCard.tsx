import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { manualStart, manualStop } from '../services/tracking/engine';
import { useLive } from '../services/tracking/liveStore';
import { startWebTracking, stopWebTracking, useWebTracking } from '../services/tracking/webTracker';
import { useSettings } from '../state/settingsStore';
import { useTheme } from '../theme';
import { formatSpeed } from '../utils/format';
import { StatusLine } from './tracking/StatusLine';
import { LiveGauge } from './trip/LiveGauge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Body } from './ui/Typography';

/** Browser version: allow location, then status + manual start/stop. */
export function WebTrackingCard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { status, screenLock } = useWebTracking();
  const phase = useLive((s) => s.phase);
  const speed = useLive((s) => s.speedKmh);
  const unit = useSettings((s) => s.speedUnit);
  const [more, setMore] = useState(false);

  const running = status === 'on' || status === 'starting';
  const driving = phase === 'driving';
  const problem = status === 'denied' || status === 'unsupported' || status === 'error';

  const detail =
    status === 'on'
      ? [driving ? null : t(`web.phase.${phase}`), screenLock ? t('web.screenOn') : null].filter(Boolean).join(' · ')
      : status === 'starting'
        ? t('web.status.starting')
        : null;

  return (
    <Card style={{ gap: theme.spacing.lg }}>
      {running ? (
        driving ? (
          <LiveGauge />
        ) : (
          <StatusLine
            tone="active"
            title={t('web.runningTitle')}
            detail={detail}
            value={status === 'on' ? formatSpeed(speed ?? 0, unit) : null}
          />
        )
      ) : (
        <View style={{ gap: 6 }}>
          <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '600' }}>{t('web.heading')}</Text>
          <Body muted style={{ fontSize: 15 }}>
            {problem ? t(`web.status.${status}`) : t('web.textShort')}
          </Body>
        </View>
      )}

      {running ? (
        <View style={{ gap: theme.spacing.xs }}>
          <Button
            label={driving ? t('tracking.manualStop') : t('tracking.manualStart')}
            onPress={() => void (driving ? manualStop() : manualStart())}
            variant={driving ? 'ghost' : 'primary'}
          />
          {driving ? null : (
            <Pressable onPress={stopWebTracking} accessibilityRole="button" hitSlop={8} style={{ alignSelf: 'center', paddingTop: 10 }}>
              <Text style={{ color: theme.colors.textMuted, fontWeight: '500', fontSize: 14 }}>{t('web.stop')}</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <>
          <Button label={t('web.start')} onPress={() => void startWebTracking()} />
          <Text style={{ color: theme.colors.textMuted, fontSize: 13, lineHeight: 18 }}>
            {t('web.footer')}{' '}
            <Text onPress={() => setMore((v) => !v)} style={{ color: theme.colors.text, fontWeight: '600' }}>
              {more ? t('web.less') : t('web.more')}
            </Text>
          </Text>
          {more ? (
            <View style={{ gap: theme.spacing.sm, marginTop: -theme.spacing.sm }}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 13, lineHeight: 18 }}>{t('web.private')}</Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 13, lineHeight: 18 }}>{t('web.limit')}</Text>
            </View>
          ) : null}
        </>
      )}
    </Card>
  );
}
