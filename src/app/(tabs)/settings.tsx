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
      <Label style={{ paddingHorizontal: 4 }}>{title}</Label>
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
        <Card flush>
          {SUPPORTED_LANGUAGES.map((l, i) => (
            <OptionRow key={l} grouped divider={i > 0} label={t(`language.${l}`)} selected={language === l} onPress={() => s.setLanguage(l)} />
          ))}
        </Card>
      </Section>
      <Section title={t('settings.theme')}>
        <Card flush>
          {MODES.map((m, i) => (
            <OptionRow key={m} grouped divider={i > 0} label={t(`theme.${m}`)} selected={s.themeMode === m} onPress={() => s.setThemeMode(m)} />
          ))}
        </Card>
      </Section>
      <Section title={t('settings.units')}>
        <Card flush>
          {UNITS.map((u, i) => (
            <OptionRow key={u} grouped divider={i > 0} label={t(`units.${u}`)} selected={s.speedUnit === u} onPress={() => s.setSpeedUnit(u)} />
          ))}
        </Card>
      </Section>
      <Card>
        <ComingSoonRow label={t('settings.account')} />
        <ComingSoonRow label={t('settings.export')} />
      </Card>
      <Pressable onPress={confirmDelete} accessibilityRole="button">
        <Text style={{ color: theme.colors.negative, fontWeight: '600', fontSize: theme.fontSize.body }}>{t('settings.deleteData')}</Text>
      </Pressable>
      <Section title={t('settings.privacy')}>
        <Body muted>{t('settings.privacyText')}</Body>
      </Section>
      <Pressable onPress={s.resetOnboarding} accessibilityRole="button">
        <Text style={{ color: theme.colors.accent, fontWeight: '600', fontSize: theme.fontSize.body }}>{t('settings.replayOnboarding')}</Text>
      </Pressable>
      <Pressable onPress={onVersionTap} accessibilityRole="text">
        <Body muted style={{ textAlign: 'center', fontSize: theme.fontSize.caption }}>
          {t('settings.version', { version: Constants.expoConfig?.version ?? '?' })}
        </Body>
      </Pressable>
    </Screen>
  );
}
