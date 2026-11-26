import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { manualStart, manualStop } from '../services/tracking/engine';
import { useLive } from '../services/tracking/liveStore';
import { startWebTracking, stopWebTracking, useWebTracking } from '../services/tracking/webTracker';
import { useSettings } from '../state/settingsStore';
import { useTheme } from '../theme';
import { formatSpeed } from '../utils/format';
import { LiveGauge } from './trip/LiveGauge';
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
  const unit = useSettings((s) => s.speedUnit);
  const [showMore, setShowMore] = useState(false);

  const running = status === 'on' || status === 'starting';
  const driving = phase === 'driving';
  const problem = status === 'denied' || status === 'unsupported' || status === 'error';
  const dot = driving ? theme.colors.accent : running ? theme.colors.positive : problem ? theme.colors.negative : theme.colors.textMuted;
  const statusText = status === 'on' ? t(`web.phase.${phase}`) : t(`web.status.${status}`);

  return (
    <Card>
      {!running ? (
        <View style={{ gap: 6, marginBottom: theme.spacing.lg }}>
          <Title style={{ fontSize: theme.fontSize.title }}>{t('web.title')}</Title>
          <Body muted>{t('web.textShort')}</Body>
        </View>
      ) : null}

      {/* Status: dot + text, current speed on the right while waiting */}
      {running || problem ? (
        <View style={[styles.status, { backgroundColor: theme.colors.surfaceElevated, borderRadius: theme.radius.md }]}>
          <View style={[styles.dot, { backgroundColor: dot }]} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: theme.fontSize.body }}>{statusText}</Text>
            {status === 'on' && screenLock ? (
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.caption, marginTop: 2 }}>{t('web.screenOn')}</Text>
            ) : null}
          </View>
          {status === 'on' && !driving ? (
            <Text style={{ color: theme.colors.textMuted, fontWeight: '700', fontSize: theme.fontSize.small }}>
              {formatSpeed(speed ?? 0, unit)}
            </Text>
          ) : null}
        </View>
      ) : null}

      {driving ? (
        <View style={{ marginTop: theme.spacing.lg }}>
          <LiveGauge />
        </View>
      ) : null}

      <View style={{ marginTop: theme.spacing.lg, gap: theme.spacing.xs }}>
        {running ? (
          <>
            <Button
              label={driving ? t('tracking.manualStop') : t('tracking.manualStart')}
              onPress={() => void (driving ? manualStop() : manualStart())}
              variant={driving ? 'ghost' : 'primary'}
            />
            <Pressable onPress={stopWebTracking} accessibilityRole="button" hitSlop={8} style={styles.link}>
              <Text style={{ color: theme.colors.textMuted, fontWeight: '700', fontSize: theme.fontSize.small }}>{t('web.stop')}</Text>
            </Pressable>
          </>
        ) : (
          <Button label={t('web.start')} onPress={() => void startWebTracking()} />
        )}
      </View>

      {/* Compact facts; the long explanation only on demand */}
      <View style={[styles.facts, { borderTopColor: theme.colors.border, marginTop: theme.spacing.md, paddingTop: theme.spacing.md }]}>
        <Fact icon="🔒" text={t('web.privateShort')} />
        <Fact icon="☀️" text={t('web.limitShort')} />
        {showMore ? (
          <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.xs }}>
            <Body muted style={{ fontSize: theme.fontSize.small }}>{t('web.private')}</Body>
            <Body muted style={{ fontSize: theme.fontSize.small }}>{t('web.limit')}</Body>
          </View>
        ) : null}
        <Pressable onPress={() => setShowMore((v) => !v)} accessibilityRole="button" hitSlop={8}>
          <Text style={{ color: theme.colors.accent, fontWeight: '700', fontSize: theme.fontSize.small }}>
            {showMore ? t('web.less') : t('web.more')}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

function Fact({ icon, text }: { icon: string; text: string }) {
  const theme = useTheme();
  return (
    <View style={styles.fact}>
      <Text style={{ fontSize: theme.fontSize.small, width: 22 }}>{icon}</Text>
      <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.small, flex: 1 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  status: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  link: { alignSelf: 'center', paddingVertical: 10 },
  facts: { borderTopWidth: StyleSheet.hairlineWidth, gap: 8 },
  fact: { flexDirection: 'row', alignItems: 'center' },
});
