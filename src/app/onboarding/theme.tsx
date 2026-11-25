import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ONBOARDING_STEPS, OnboardingStep } from '../../components/onboarding/OnboardingStep';
import { Button } from '../../components/ui/Button';
import { OptionRow } from '../../components/ui/OptionRow';
import { useSettings } from '../../state/settingsStore';
import type { ThemeMode } from '../../theme';

const MODES: ThemeMode[] = ['dark', 'light'];

export default function ThemeStep() {
  const { t } = useTranslation();
  const mode = useSettings((s) => s.themeMode);
  const setMode = useSettings((s) => s.setThemeMode);

  return (
    <OnboardingStep
      step={2}
      total={ONBOARDING_STEPS}
      title={t('onboarding.theme.title')}
      subtitle={t('onboarding.theme.subtitle')}
      footer={
        <>
          <Button label={t('common.next')} onPress={() => router.push('/onboarding/account')} />
          <Button label={t('common.back')} variant="ghost" onPress={() => router.back()} />
        </>
      }
    >
      {MODES.map((m) => (
        <OptionRow key={m} label={t(`theme.${m}`)} selected={mode === m} onPress={() => setMode(m)} />
      ))}
    </OnboardingStep>
  );
}
