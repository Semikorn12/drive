import { useTranslation } from 'react-i18next';

import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Body } from '../../components/ui/Typography';

export default function AchievementsScreen() {
  const { t } = useTranslation();
  return (
    <Screen title={t('achievements.title')}>
      <Card decoId="achievements">
        <Body muted>{t('achievements.text')}</Body>
      </Card>
    </Screen>
  );
}
