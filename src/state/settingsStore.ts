import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ThemeMode } from '../theme/themes';

export type Language = 'de' | 'en';
export type SpeedUnit = 'kmh' | 'mph';

export interface SettingsState {
  language: Language | null; // null = not chosen yet → device language
  themeMode: ThemeMode;
  speedUnit: SpeedUnit;
  onboardingDone: boolean;
  hasHydrated: boolean;
  setLanguage: (language: Language) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setSpeedUnit: (unit: SpeedUnit) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

/**
 * Small user preferences (not trip data – trips go to SQLite in phase 2).
 * Persisted in AsyncStorage so they survive app restarts.
 */
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      language: null,
      themeMode: 'dark',
      speedUnit: 'kmh',
      onboardingDone: false,
      hasHydrated: false,
      setLanguage: (language) => set({ language }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setSpeedUnit: (speedUnit) => set({ speedUnit }),
      completeOnboarding: () => set({ onboardingDone: true }),
      resetOnboarding: () => set({ onboardingDone: false }),
    }),
    {
      name: 'drive.settings.v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ language, themeMode, speedUnit, onboardingDone }) => ({
        language,
        themeMode,
        speedUnit,
        onboardingDone,
      }),
      onRehydrateStorage: () => () => {
        useSettings.setState({ hasHydrated: true });
      },
    },
  ),
);
