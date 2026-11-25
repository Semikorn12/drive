import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * ⚠️ Change this ONCE to your own reverse-domain id before the first build
 * (letters, digits and dots only – no "!"). Example: com.maxmustermann.drive
 */
const BUNDLE_ID = 'com.meinname.drive';

const SPLASH_BG = '#070F2B';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Dr!ve', // shown under the icon
  slug: 'drive', // technical name, no special characters
  scheme: 'drive',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  backgroundColor: SPLASH_BG,
  ios: {
    bundleIdentifier: BUNDLE_ID,
    supportsTablet: false,
    buildNumber: '1',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: BUNDLE_ID,
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: SPLASH_BG,
      foregroundImage: './assets/images/android-icon-foreground.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    'expo-status-bar',
    [
      'expo-splash-screen',
      {
        // Native splash = plain dark blue. The animated logo is drawn by JS (IntroAnimation).
        backgroundColor: SPLASH_BG,
        image: './assets/images/splash-transparent.png',
        imageWidth: 1,
      },
    ],
    'expo-localization',
    'expo-font',
  ],
  experiments: {
    typedRoutes: true,
  },
});
