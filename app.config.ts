import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Reverse-domain app id (letters, digits and dots only – no "!").
 * Do not change it after the app is in the App Store.
 */
const BUNDLE_ID = 'com.semion.drive';

const SPLASH_BG = '#070F2B';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const EN = require('./locales/ios/en.json').ios as Record<string, string>;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Dr!ve', // shown under the icon
  slug: 'drive', // technical name, no special characters
  owner: 'semikorn12', // Expo account that owns the project
  scheme: 'drive',
  extra: {
    ...config.extra,
    // Links this app to the Expo/EAS project (from `eas init`). Not a secret.
    eas: { projectId: 'c2017742-9ae9-45a0-a9d3-b5aef9e047a8' },
  },
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
      CFBundleAllowMixedLocalizations: true,
    },
  },
  // Localised app name + permission texts for iOS (English is the base text in the plugins below).
  locales: {
    de: './locales/ios/de.json',
    en: './locales/ios/en.json',
  },
  android: {
    package: BUNDLE_ID,
    permissions: ['ACTIVITY_RECOGNITION'],
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
    ['expo-localization', { supportedLocales: { ios: ['de', 'en'], android: ['de', 'en'] } }],
    'expo-font',
    [
      'expo-location',
      {
        locationWhenInUsePermission: EN.NSLocationWhenInUseUsageDescription,
        locationAlwaysAndWhenInUsePermission: EN.NSLocationAlwaysAndWhenInUseUsageDescription,
        motionUsagePermission: EN.NSMotionUsageDescription,
        isIosBackgroundLocationEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
        isAndroidForegroundServiceEnabled: true,
      },
    ],
    'expo-sqlite',
    ['expo-notifications', { color: '#FF8A2A' }],
    'expo-document-picker',
  ],
  experiments: {
    typedRoutes: true,
    // Only for the web preview on GitHub Pages (served under /drive/). Empty for the iPhone app.
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
