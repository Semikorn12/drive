import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { TabIcon, type TabIconName } from '../../components/ui/TabIcon';
import { useTheme } from '../../theme';

const TABS: { name: string; icon: TabIconName; label: string }[] = [
  { name: 'index', icon: 'week', label: 'tabs.week' },
  { name: 'trips', icon: 'trips', label: 'tabs.trips' },
  { name: 'compare', icon: 'compare', label: 'tabs.compare' },
  { name: 'achievements', icon: 'achievements', label: 'tabs.achievements' },
  { name: 'settings', icon: 'settings', label: 'tabs.settings' },
];

export default function TabsLayout() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const insets = useSafeAreaInsets();
  // Browsers report no bottom inset in normal Safari → keep a little room under the labels.
  const bottom = Platform.OS === 'web' ? Math.max(insets.bottom, 8) : insets.bottom;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.colors.accent,
        tabBarInactiveTintColor: t.colors.tabInactive,
        tabBarStyle: {
          backgroundColor: t.colors.tabBar,
          borderTopColor: t.colors.separator,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          ...(Platform.OS === 'web' ? { height: 54 + bottom, paddingBottom: bottom } : {}),
        },
        tabBarLabelStyle: { fontFamily: t.fonts.medium, fontSize: 11, lineHeight: 14, paddingBottom: 1 },
        sceneStyle: { backgroundColor: t.colors.background },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tr(tab.label),
            tabBarIcon: ({ color }) => <TabIcon name={tab.icon} color={color} size={23} />,
          }}
        />
      ))}
    </Tabs>
  );
}
