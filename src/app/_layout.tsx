import { applyLanguage } from '../i18n';
// Background tasks must be registered at module scope, before anything renders.
import '../services/tracking/tasks';

import { BarlowSemiCondensed_600SemiBold } from '@expo-google-fonts/barlow-semi-condensed/600SemiBold';
import { BarlowSemiCondensed_700Bold } from '@expo-google-fonts/barlow-semi-condensed/700Bold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { IntroAnimation } from '../components/brand/IntroAnimation';
import { useTrackingLifecycle } from '../hooks/useTrackingLifecycle';
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
  const language = useSettings((s) => s.language);
  // Safety net: make sure the saved language is active before any screen renders (idempotent).
  if (hydrated) applyLanguage(language);
  const t = useTheme();
  // Fonts load while the intro plays; screens render once they're ready (no flash of system font).
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    BarlowSemiCondensed_600SemiBold,
    BarlowSemiCondensed_700Bold,
  });
  const ready = hydrated && (fontsLoaded || !!fontError);

  // Browser: colour Safari's bars + page background like the app.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.documentElement.style.backgroundColor = t.colors.background;
    document.body.style.backgroundColor = t.colors.background;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.colors.background);
  }, [t.colors.background]);
  const [showIntro, setShowIntro] = useState(!introPlayedThisProcess);
  useTrackingLifecycle(hydrated && onboardingDone);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: t.colors.background }}>
        <StatusBar style={showIntro || t.mode === 'dark' ? 'light' : 'dark'} />
        {/* App content renders (and loads its data) underneath the intro, in parallel. */}
        {ready ? (
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.colors.background } }}>
            <Stack.Protected guard={!onboardingDone}>
              <Stack.Screen name="onboarding" />
            </Stack.Protected>
            <Stack.Protected guard={onboardingDone}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="diagnostics" options={{ presentation: 'card' }} />
              <Stack.Screen name="trip/start" />
              <Stack.Screen name="trip/stop" />
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
