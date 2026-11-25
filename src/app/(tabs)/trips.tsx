import { useTranslation } from 'react-i18next';

import { AdBanner } from '../../components/AdBanner';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Body } from '../../components/ui/Typography';

export default function TripsScreen() {
  const { t } = useTranslation();
  return (
    <Screen title={t('trips.title')}>
      <Card>
        <Body muted>{t('trips.empty')}</Body>
      </Card>
      <AdBanner placement="tripList" />
    </Screen>
  );
}
