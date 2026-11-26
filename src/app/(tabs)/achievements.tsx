import { useTranslation } from 'react-i18next';

import { EmptyState } from '../../components/ui/EmptyState';
import { Screen } from '../../components/ui/Screen';

export default function AchievementsScreen() {
  const { t } = useTranslation();
  return (
    <Screen title={t('achievements.title')}>
      <EmptyState icon="trophy" title={t('empty.achTitle')} text={t('empty.achText')} />
    </Screen>
  );
}
