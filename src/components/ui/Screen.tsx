import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme';
import { AppHeader } from './AppHeader';

interface Props {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
}

/** Standard screen: header + themed background + padded content. */
export function Screen({ title, subtitle, children, scroll = true }: Props) {
  const t = useTheme();
  const content = <View style={{ paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.md, gap: t.spacing.lg }}>{children}</View>;
  return (
    <View style={[styles.root, { backgroundColor: t.colors.background }]}>
      <AppHeader title={title} subtitle={subtitle} />
      {scroll ? (
        <ScrollView contentContainerStyle={{ paddingBottom: t.spacing.xxxl }} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
