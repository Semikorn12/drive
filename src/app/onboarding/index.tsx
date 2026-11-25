import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ONBOARDING_STEPS, OnboardingStep } from '../../components/onboarding/OnboardingStep';
import { Button } from '../../components/ui/Button';
import { OptionRow } from '../../components/ui/OptionRow';
import { deviceLanguage, SUPPORTED_LANGUAGES } from '../../i18n';
import { useSettings } from '../../state/settingsStore';

export default function LanguageStep() {
  const { t } = useTranslation();
  const language = useSettings((s) => s.language) ?? deviceLanguage();
  const setLanguage = useSettings((s) => s.setLanguage);

  return (
    <OnboardingStep
      step={1}
      total={ONBOARDING_STEPS}
      title={t('onboarding.language.title')}
      subtitle={t('onboarding.language.subtitle')}
      footer={
        <Button
          label={t('common.next')}
          onPress={() => {
            setLanguage(language); // persist even if the user kept the default
            router.push('/onboarding/theme');
          }}
        />
      }
    >
      {SUPPORTED_LANGUAGES.map((lng) => (
        <OptionRow key={lng} label={t(`language.${lng}`)} selected={language === lng} onPress={() => setLanguage(lng)} />
      ))}
    </OnboardingStep>
  );
}
