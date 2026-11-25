import Constants from 'expo-constants';
import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { useRef } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '../../components/ui/Card';
import { OptionRow } from '../../components/ui/OptionRow';
import { Screen } from '../../components/ui/Screen';
import { Body, Label } from '../../components/ui/Typography';
import { deviceLanguage, SUPPORTED_LANGUAGES } from '../../i18n';
import { wipeLocalDatabase } from '../../data/db';
import { resetEngine } from '../../services/tracking/engine';
import { useSettings, type SpeedUnit } from '../../state/settingsStore';
import { useTheme, type ThemeMode } from '../../theme';

const MODES: ThemeMode[] = ['dark', 'light'];
const UNITS: SpeedUnit[] = ['kmh', 'mph'];

function Section({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Label>{title}</Label>
      {children}
    </View>
  );
}

function ComingSoonRow({ label }: { label: string }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.sm, opacity: 0.5 }}>
      <Body>{label}</Body>
      <Body muted>{t('common.comingSoon')}</Body>
    </View>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const s = useSettings();
  const language = s.language ?? deviceLanguage();
  const taps = useRef({ n: 0, last: 0 });

  // Hidden diagnostics: tap the version 7× within a few seconds.
  const onVersionTap = () => {
    const now = Date.now();
    taps.current = { n: now - taps.current.last < 1500 ? taps.current.n + 1 : 1, last: now };
    if (taps.current.n >= 7) {
      taps.current.n = 0;
      router.push('/diagnostics');
    }
  };

  const confirmDelete = () =>
    Alert.alert(t('settings.deleteConfirmTitle'), t('settings.deleteConfirmText'), [
      { text: t('settings.cancel'), style: 'cancel' },
      {
        text: t('settings.deleteConfirm'),
        style: 'destructive',
        onPress: async () => {
          await resetEngine();
          await wipeLocalDatabase();
          Alert.alert(t('settings.deleted'));
        },
      },
    ]);

  return (
    <Screen title={t('settings.title')}>
      <Section title={t('settings.language')}>
        {SUPPORTED_LANGUAGES.map((l) => (
          <OptionRow key={l} label={t(`language.${l}`)} selected={language === l} onPress={() => s.setLanguage(l)} />
        ))}
      </Section>
      <Section title={t('settings.theme')}>
        {MODES.map((m) => (
          <OptionRow key={m} label={t(`theme.${m}`)} selected={s.themeMode === m} onPress={() => s.setThemeMode(m)} />
        ))}
      </Section>
      <Section title={t('settings.units')}>
        {UNITS.map((u) => (
          <OptionRow key={u} label={t(`units.${u}`)} selected={s.speedUnit === u} onPress={() => s.setSpeedUnit(u)} />
        ))}
      </Section>
      <Card>
        <ComingSoonRow label={t('settings.account')} />
        <ComingSoonRow label={t('settings.export')} />
      </Card>
      <Pressable onPress={confirmDelete} accessibilityRole="button">
        <Text style={{ color: theme.colors.negative, fontWeight: '700' }}>{t('settings.deleteData')}</Text>
      </Pressable>
      <Section title={t('settings.privacy')}>
        <Body muted>{t('settings.privacyText')}</Body>
      </Section>
      <Pressable onPress={s.resetOnboarding} accessibilityRole="button">
        <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>{t('settings.replayOnboarding')}</Text>
      </Pressable>
      <Pressable onPress={onVersionTap} accessibilityRole="text">
        <Body muted style={{ textAlign: 'center', fontSize: theme.fontSize.caption }}>
          {t('settings.version', { version: Constants.expoConfig?.version ?? '?' })}
        </Body>
      </Pressable>
    </Screen>
  );
}
