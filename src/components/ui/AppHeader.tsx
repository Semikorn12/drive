import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme';
import { HEADER_LOGO_TOP, HEADER_LOGO_WIDTH } from '../brand/brandLayout';
import { Logo } from '../brand/Logo';
import { Caption, Title } from './Typography';

/** Slim header: small centered wordmark (where the intro animation lands), then a left-aligned title. */
export function AppHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const insets = useSafeAreaInsets();
  const t = useTheme();
  return (
    <View style={{ paddingTop: insets.top + HEADER_LOGO_TOP, backgroundColor: t.colors.background }}>
      <View style={styles.logoRow}>
        <Logo width={HEADER_LOGO_WIDTH} color={t.colors.text} />
      </View>
      {title ? (
        <View style={{ paddingHorizontal: t.spacing.xl - 4, paddingTop: t.spacing.lg, paddingBottom: t.spacing.xs }}>
          <Title accessibilityRole="header">{title}</Title>
          {subtitle ? <Caption style={{ marginTop: 2 }}>{subtitle}</Caption> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  logoRow: { alignItems: 'center', paddingBottom: 4 },
});
