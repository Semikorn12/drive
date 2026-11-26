import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { useSettings, type Language } from '../state/settingsStore';
import de from './locales/de.json';
import en from './locales/en.json';

export const SUPPORTED_LANGUAGES: Language[] = ['de', 'en'];

export function deviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode ?? 'en';
  return code === 'de' ? 'de' : 'en';
}

void i18n.use(initReactI18next).init({
  resources: { de: { translation: de }, en: { translation: en } },
  lng: deviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes
  returnNull: false,
});

export function applyLanguage(language: Language | null) {
  const target = language ?? deviceLanguage();
  if (i18n.language !== target) void i18n.changeLanguage(target);
}

export default i18n;

// Keep i18next in sync with the persisted language choice.
useSettings.subscribe((s, prev) => {
  if (s.language !== prev.language || (s.hasHydrated && !prev.hasHydrated)) applyLanguage(s.language);
});
// If the settings were already loaded before this subscription existed, apply them now.
if (useSettings.getState().hasHydrated) applyLanguage(useSettings.getState().language);
