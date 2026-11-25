import { useTranslation } from 'react-i18next';

import { ONBOARDING_STEPS, OnboardingStep } from '../../components/onboarding/OnboardingStep';
import { Button } from '../../components/ui/Button';
import { useSettings } from '../../state/settingsStore';

/**
 * Last step (after the permission explainers).
 */
export default function FinishStep() {
  const { t } = useTranslation();
  const complete = useSettings((s) => s.completeOnboarding);
  return (
    <OnboardingStep
      step={7}
      total={ONBOARDING_STEPS}
      title={t('onboarding.finish.title')}
      subtitle={t('onboarding.finish.subtitle')}
      // Completing flips the Stack.Protected guard → router switches to the tabs automatically.
      footer={<Button label={t('onboarding.finish.start')} onPress={complete} />}
    />
  );
}
