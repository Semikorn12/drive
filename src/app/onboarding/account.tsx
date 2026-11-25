import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ONBOARDING_STEPS, OnboardingStep } from '../../components/onboarding/OnboardingStep';
import { Button } from '../../components/ui/Button';

/** Account creation arrives in phase 5 (Supabase). For now: "later" only. */
export default function AccountStep() {
  const { t } = useTranslation();
  return (
    <OnboardingStep
      step={3}
      total={ONBOARDING_STEPS}
      title={t('onboarding.account.title')}
      subtitle={t('onboarding.account.subtitle')}
      footer={
        <>
          <Button label={`${t('onboarding.account.create')} · ${t('common.comingSoon')}`} onPress={() => {}} disabled />
          <Button label={t('onboarding.account.skip')} variant="ghost" onPress={() => router.push('/onboarding/finish')} />
        </>
      }
    />
  );
}
