import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme';
import { AppHeader } from './AppHeader';

interface Props {
  title?: string;
  children: ReactNode;
  scroll?: boolean;
  /** Shows a back button in the header. */
  onBack?: () => void;
}

/** Standard screen: header + themed background + padded content. */
export function Screen({ title, children, scroll = true, onBack }: Props) {
  const t = useTheme();
  const content = <View style={{ padding: t.spacing.lg, gap: t.spacing.lg }}>{children}</View>;
  return (
    <View style={[styles.root, { backgroundColor: t.colors.background }]}>
      <AppHeader title={title} onBack={onBack} />
      {scroll ? <ScrollView contentContainerStyle={{ paddingBottom: t.spacing.xxxl }}>{content}</ScrollView> : content}
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
