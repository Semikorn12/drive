import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme';
import { HEADER_LOGO_TOP, HEADER_LOGO_WIDTH } from '../brand/brandLayout';
import { Logo } from '../brand/Logo';
import { DecoCurves } from './DecoCurves';

/** Cockpit-style header with the Dr!ve logo at the exact spot the intro animation lands. */
export function AppHeader({ title }: { title?: string }) {
  const insets = useSafeAreaInsets();
  const t = useTheme();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + HEADER_LOGO_TOP, backgroundColor: t.colors.background }]}>
      <DecoCurves id="header" variant="header" />
      <View style={styles.logoRow}>
        <Logo width={HEADER_LOGO_WIDTH} color={t.colors.text} />
      </View>
      {title ? (
        <Text style={[styles.title, { color: t.colors.text, fontSize: t.fontSize.headline, paddingHorizontal: t.spacing.lg }]}>
          {title}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', paddingBottom: 12 },
  logoRow: { alignItems: 'center' },
  title: { fontWeight: '800', marginTop: 8, letterSpacing: 0.3 },
});
