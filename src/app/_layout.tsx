import '../i18n';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { IntroAnimation } from '../components/brand/IntroAnimation';
import { useSettings } from '../state/settingsStore';
import { useTheme } from '../theme';

// The native splash only shows the dark blue background; we hide it as soon as the
// intro overlay (same colour) is on screen, so the hand-over is invisible.
void SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ fade: false, duration: 0 });

/** True once the intro ran in this process → coming back from background never replays it. */
let introPlayedThisProcess = false;

export default function RootLayout() {
  const hydrated = useSettings((s) => s.hasHydrated);
  const onboardingDone = useSettings((s) => s.onboardingDone);
  const t = useTheme();
  const [showIntro, setShowIntro] = useState(!introPlayedThisProcess);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: t.colors.background }}>
        <StatusBar style={showIntro || t.mode === 'dark' ? 'light' : 'dark'} />
        {/* App content renders (and loads its data) underneath the intro, in parallel. */}
        {hydrated ? (
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.colors.background } }}>
            <Stack.Protected guard={!onboardingDone}>
              <Stack.Screen name="onboarding" />
            </Stack.Protected>
            <Stack.Protected guard={onboardingDone}>
              <Stack.Screen name="(tabs)" />
            </Stack.Protected>
          </Stack>
        ) : null}
        {showIntro ? (
          <IntroAnimation
            onReady={() => void SplashScreen.hideAsync().catch(() => {})}
            onFinish={() => {
              introPlayedThisProcess = true;
              setShowIntro(false);
            }}
          />
        ) : null}
      </View>
    </SafeAreaProvider>
  );
}

// Fallback: if the intro is not shown (e.g. after a fast refresh), make sure the splash goes away.
if (introPlayedThisProcess) void SplashScreen.hideAsync().catch(() => {});
