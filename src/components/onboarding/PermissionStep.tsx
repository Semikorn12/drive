import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { PermState } from '../../services/permissions';
import { openAppSettings } from '../../services/permissions';
import { useTheme } from '../../theme';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Body } from '../ui/Typography';
import { ONBOARDING_STEPS, OnboardingStep } from './OnboardingStep';

interface Props {
  step: number;
  /** i18n prefix, e.g. "onboarding.perm.location" */
  prefix: string;
  bullets: string[];
  request: () => Promise<PermState>;
  next: Href;
}

/** Explains ONE permission in plain words, then asks the system for it. */
export function PermissionStep({ step, prefix, bullets, request, next }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [result, setResult] = useState<PermState | null>(null);
  const [busy, setBusy] = useState(false);

  const ask = async () => {
    setBusy(true);
    try {
      setResult(await request());
    } catch {
      setResult('denied');
    } finally {
      setBusy(false);
    }
  };

  const message =
    result === 'granted'
      ? t('onboarding.perm.granted')
      : result === 'limited'
        ? t(`${prefix}.limited`)
        : result === 'denied'
          ? t('onboarding.perm.denied')
          : null;

  return (
    <OnboardingStep
      step={step}
      total={ONBOARDING_STEPS}
      title={t(`${prefix}.title`)}
      subtitle={t(`${prefix}.subtitle`)}
      footer={
        result == null ? (
          <>
            <Button label={t('onboarding.perm.allow')} onPress={ask} disabled={busy} />
            <Button label={t('onboarding.perm.notNow')} variant="ghost" onPress={() => router.push(next)} />
          </>
        ) : (
          <>
            <Button label={t('common.next')} onPress={() => router.push(next)} />
            {result !== 'granted' ? (
              <Button label={t('onboarding.perm.openSettings')} variant="ghost" onPress={() => void openAppSettings()} />
            ) : null}
          </>
        )
      }
    >
      {bullets.map((b) => (
        <View key={b} style={styles.row}>
          <View style={[styles.bullet, { backgroundColor: theme.colors.accent }]} />
          <Body style={{ flex: 1 }}>{t(`${prefix}.${b}`)}</Body>
        </View>
      ))}
      {message ? (
        <Card>
          <Text style={{ color: result === 'granted' ? theme.colors.positive : theme.colors.text, fontSize: theme.fontSize.body }}>
            {message}
          </Text>
        </Card>
      ) : null}
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  bullet: { width: 8, height: 8, borderRadius: 4, marginTop: 8 },
});
