import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme';
import { Icon } from './Icon';
import { Label } from './Typography';

/** Grouped list (like iOS Settings): optional title, rows separated by hairlines. */
export function ListGroup({ title, footer, children }: { title?: string; footer?: string; children: ReactNode }) {
  const t = useTheme();
  const items = Children.toArray(children).filter(Boolean);
  return (
    <View style={{ gap: 8 }}>
      {title ? <View style={{ paddingHorizontal: 4 }}><Label>{title}</Label></View> : null}
      <View style={{ backgroundColor: t.colors.surface, borderRadius: t.radius.xl, overflow: 'hidden' }}>
        {items.map((child, i) => (
          <Fragment key={i}>
            {i > 0 ? <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.colors.separator, marginLeft: 16 }} /> : null}
            {child}
          </Fragment>
        ))}
      </View>
      {footer ? (
        <Text style={{ color: t.colors.textFaint, fontFamily: t.fonts.regular, fontSize: t.fontSize.caption, lineHeight: 17, paddingHorizontal: 4 }}>{footer}</Text>
      ) : null}
    </View>
  );
}

interface RowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  right?: ReactNode;
  tone?: 'default' | 'danger' | 'accent';
  disabled?: boolean;
  chevron?: boolean;
}

export function ListRow({ label, value, onPress, right, tone = 'default', disabled, chevron }: RowProps) {
  const t = useTheme();
  const color = tone === 'danger' ? t.colors.negative : tone === 'accent' ? t.colors.accent : t.colors.text;
  const content = (
    <View style={[styles.row, { opacity: disabled ? 0.45 : 1 }]}>
      <Text style={{ color, fontFamily: t.fonts.regular, fontSize: t.fontSize.body, flex: 1 }}>{label}</Text>
      {value ? <Text style={{ color: t.colors.textMuted, fontFamily: t.fonts.regular, fontSize: t.fontSize.body }}>{value}</Text> : null}
      {right}
      {chevron ? <Icon name="chevron" size={16} color={t.colors.textFaint} /> : null}
    </View>
  );
  if (!onPress || disabled) return content;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ backgroundColor: pressed ? t.colors.surfaceElevated : 'transparent' })}>
      {content}
    </Pressable>
  );
}

/** Row whose right side is a control (e.g. a segmented switch). */
export function ListControlRow({ label, children }: { label: string; children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={[styles.row, { gap: 16 }]}>
      <Text style={{ color: t.colors.text, fontFamily: t.fonts.regular, fontSize: t.fontSize.body }}>{label}</Text>
      <View style={{ flex: 1, maxWidth: 210, marginLeft: 'auto' }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, minHeight: 52, paddingVertical: 10 },
});
