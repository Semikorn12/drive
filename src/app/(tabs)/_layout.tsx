import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
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
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.colors.accent,
        tabBarInactiveTintColor: t.colors.tabInactive,
        tabBarStyle: { backgroundColor: t.colors.tabBar, borderTopColor: t.colors.border, borderTopWidth: StyleSheet.hairlineWidth },
        tabBarLabelStyle: { fontWeight: '500', fontSize: 11 },
        sceneStyle: { backgroundColor: t.colors.background },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tr(tab.label),
            tabBarIcon: ({ color }) => <TabIcon name={tab.icon} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
