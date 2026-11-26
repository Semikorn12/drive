import { useTranslation } from 'react-i18next';

import { EmptyState } from '../../components/ui/EmptyState';
import { Screen } from '../../components/ui/Screen';

export default function CompareScreen() {
  const { t } = useTranslation();
  return (
    <Screen title={t('compare.title')}>
      <EmptyState icon="users" title={t('empty.compareTitle')} text={t('empty.compareText')} />
    </Screen>
  );
}
