import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useRef } from 'react';
import { Alert, Platform, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ListControlRow, ListGroup, ListRow } from '../../components/ui/List';
import { Screen } from '../../components/ui/Screen';
import { Segmented } from '../../components/ui/Segmented';
import { Caption } from '../../components/ui/Typography';
import { wipeLocalDatabase } from '../../data/db';
import { deviceLanguage } from '../../i18n';
import { resetEngine } from '../../services/tracking/engine';
import { useSettings, type Language, type SpeedUnit } from '../../state/settingsStore';
import type { ThemeMode } from '../../theme';

export default function SettingsScreen() {
  const { t } = useTranslation();
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

  const wipe = async () => {
    await resetEngine();
    await wipeLocalDatabase();
  };

  const confirmDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(`${t('settings.deleteConfirmTitle')}\n\n${t('settings.deleteConfirmText')}`)) void wipe();
      return;
    }
    Alert.alert(t('settings.deleteConfirmTitle'), t('settings.deleteConfirmText'), [
      { text: t('settings.cancel'), style: 'cancel' },
      { text: t('settings.deleteConfirm'), style: 'destructive', onPress: () => void wipe().then(() => Alert.alert(t('settings.deleted'))) },
    ]);
  };

  return (
    <Screen title={t('settings.title')}>
      <ListGroup title={t('settings.general')}>
        <ListControlRow label={t('settings.language')}>
          <Segmented<Language>
            value={language}
            onChange={s.setLanguage}
            options={[
              { value: 'de', label: 'Deutsch' },
              { value: 'en', label: 'English' },
            ]}
          />
        </ListControlRow>
        <ListControlRow label={t('settings.theme')}>
          <Segmented<ThemeMode>
            value={s.themeMode}
            onChange={s.setThemeMode}
            options={[
              { value: 'dark', label: t('theme.dark') },
              { value: 'light', label: t('theme.light') },
            ]}
          />
        </ListControlRow>
        <ListControlRow label={t('settings.units')}>
          <Segmented<SpeedUnit>
            value={s.speedUnit}
            onChange={s.setSpeedUnit}
            options={[
              { value: 'kmh', label: 'km/h' },
              { value: 'mph', label: 'mph' },
            ]}
          />
        </ListControlRow>
      </ListGroup>

      <ListGroup title={t('settings.account')}>
        <ListRow label={t('settings.account')} value={t('common.comingSoon')} disabled />
      </ListGroup>

      <ListGroup title={t('settings.data')} footer={t('settings.privacyText')}>
        <ListRow label={t('settings.export')} value={t('common.comingSoon')} disabled />
        <ListRow label={t('settings.deleteData')} tone="danger" onPress={confirmDelete} />
      </ListGroup>

      <ListGroup title={t('settings.about')}>
        <ListRow label={t('settings.replayOnboarding')} onPress={s.resetOnboarding} chevron />
      </ListGroup>

      <Pressable onPress={onVersionTap} accessibilityRole="text" style={{ alignItems: 'center', paddingVertical: 8 }}>
        <Caption>{t('settings.version', { version: Constants.expoConfig?.version ?? '?' })}</Caption>
      </Pressable>
    </Screen>
  );
}
