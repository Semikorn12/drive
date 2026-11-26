import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme';
import { Icon, type IconName } from './Icon';
import { Body, Heading } from './Typography';

/** Centered placeholder for screens without content yet. */
export function EmptyState({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  const t = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.badge, { backgroundColor: t.colors.surface }]}>
        <Icon name={icon} size={26} color={t.colors.accent} />
      </View>
      <Heading style={{ textAlign: 'center' }}>{title}</Heading>
      <Body muted style={{ textAlign: 'center', maxWidth: 300 }}>
        {text}
      </Body>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10, paddingVertical: 56, paddingHorizontal: 24 },
  badge: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
});
