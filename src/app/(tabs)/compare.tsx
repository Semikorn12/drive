import { useTranslation } from 'react-i18next';

import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Body } from '../../components/ui/Typography';

export default function CompareScreen() {
  const { t } = useTranslation();
  return (
    <Screen title={t('compare.title')}>
      <Card decoId="compare">
        <Body muted>{t('compare.text')}</Body>
      </Card>
    </Screen>
  );
}
