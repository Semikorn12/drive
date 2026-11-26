import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme';
import { HEADER_LOGO_TOP, HEADER_LOGO_WIDTH } from '../brand/brandLayout';
import { Logo } from '../brand/Logo';

/** Header with the Dr!ve logo at the exact spot the intro animation lands, then a large left-aligned title. */
export function AppHeader({ title, onBack }: { title?: string; onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  const t = useTheme();
  const { t: tr } = useTranslation();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + HEADER_LOGO_TOP, backgroundColor: t.colors.background }]}>
      <View style={styles.logoRow}>
        <Logo width={HEADER_LOGO_WIDTH} color={t.colors.text} />
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={tr('common.back')}
            hitSlop={12}
            style={[styles.back, { left: t.spacing.lg }]}
          >
            <Text style={{ color: t.colors.accent, fontSize: t.fontSize.body, fontWeight: '600' }}>‹ {tr('common.back')}</Text>
          </Pressable>
        ) : null}
      </View>
      {title ? (
        <Text
          style={[
            styles.title,
            { color: t.colors.text, fontSize: t.fontSize.headline, paddingHorizontal: t.spacing.lg, marginTop: t.spacing.lg },
          ]}
        >
          {title}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 4 },
  logoRow: { alignItems: 'center', justifyContent: 'center' },
  back: { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center' },
  title: { fontWeight: '700', letterSpacing: -0.6 },
});
