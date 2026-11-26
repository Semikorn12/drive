import { useTranslation } from 'react-i18next';

import { AdBanner } from '../../components/AdBanner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Screen } from '../../components/ui/Screen';

export default function TripsScreen() {
  const { t } = useTranslation();
  return (
    <Screen title={t('trips.title')}>
      <EmptyState icon="route" title={t('empty.tripsTitle')} text={t('empty.tripsText')} />
      <AdBanner placement="tripList" />
    </Screen>
  );
}
