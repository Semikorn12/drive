import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme';
import { AppHeader } from '../ui/AppHeader';
import { Body, Title } from '../ui/Typography';

interface Props {
  step: number;
  total: number;
  title: string;
  subtitle: string;
  children?: ReactNode;
  footer: ReactNode;
}

export function OnboardingStep({ step, total, title, subtitle, children, footer }: Props) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { backgroundColor: t.colors.background }]}>
      <AppHeader />
      <ScrollView contentContainerStyle={{ padding: t.spacing.xl, gap: t.spacing.lg }}>
        <View style={styles.dots} accessibilityLabel={tr('onboarding.step', { current: step, total })}>
          {Array.from({ length: total }, (_, i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: i < step ? t.colors.accent : t.colors.border, width: i === step - 1 ? 24 : 8 }]}
            />
          ))}
        </View>
        <Title>{title}</Title>
        <Body muted>{subtitle}</Body>
        <View style={{ gap: t.spacing.md, marginTop: t.spacing.md }}>{children}</View>
      </ScrollView>
      <View style={{ padding: t.spacing.xl, paddingBottom: insets.bottom + t.spacing.lg, gap: t.spacing.md }}>{footer}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
});

export const ONBOARDING_STEPS = 7;
