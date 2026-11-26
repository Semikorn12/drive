import { Platform, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TrackingCard } from '../../components/TrackingCard';
import { WebTrackingCard } from '../../components/WebTrackingCard';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Body, Label, Title } from '../../components/ui/Typography';
import { useTheme } from '../../theme';

/** Week overview – real numbers arrive in phase 4. */
export default function WeekScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const stats = [
    { key: 'distance', value: '0', unit: 'km' },
    { key: 'trips', value: '0', unit: '' },
    { key: 'duration', value: '0:00', unit: 'h' },
    { key: 'streak', value: '0', unit: '' },
  ];
  return (
    <Screen title={t('week.title')}>
      {Platform.OS === 'web' ? <WebTrackingCard /> : <TrackingCard />}
      <View style={styles.grid}>
        {stats.map((s) => (
          <Card key={s.key} style={styles.tile}>
            <Label>{t(`week.${s.key}`)}</Label>
            <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.display, fontWeight: '900', marginTop: 4 }}>
              {s.value}
              <Text style={{ color: theme.colors.accent, fontSize: theme.fontSize.body, fontWeight: '700' }}> {s.unit}</Text>
            </Text>
          </Card>
        ))}
      </View>
      <Card>
        <Title style={{ fontSize: theme.fontSize.title }}>{t('week.emptyTitle')}</Title>
        <Body muted style={{ marginTop: 6 }}>
          {t('week.emptyText')}
        </Body>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { flexBasis: '47%', flexGrow: 1 },
});
