import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ColorScheme } from '@/theme/tokens';

export type ThemePreference = ColorScheme | 'system';

export type PatientProfile = {
  firstName: string;
  diabetesType: 'type1' | 'type2' | 'gestationnel' | 'aucun';
  /** Année du diagnostic, saisie libre pour rester simple à renseigner. */
  diagnosisYear: string;
};

type SettingsState = {
  themePreference: ThemePreference;
  hapticsEnabled: boolean;
  onboardingDone: boolean;
  /** Rappel de dépistage, en mois. 0 désactive le rappel. */
  reminderMonths: number;
  profile: PatientProfile;
  /** Passe à vrai une fois les préférences relues depuis le stockage. */
  hydrated: boolean;

  setThemePreference: (value: ThemePreference) => void;
  setHapticsEnabled: (value: boolean) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setReminderMonths: (value: number) => void;
  updateProfile: (patch: Partial<PatientProfile>) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      themePreference: 'dark',
      hapticsEnabled: true,
      onboardingDone: false,
      reminderMonths: 12,
      profile: { firstName: '', diabetesType: 'type2', diagnosisYear: '' },
      hydrated: false,

      setThemePreference: (themePreference) => set({ themePreference }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      completeOnboarding: () => set({ onboardingDone: true }),
      resetOnboarding: () => set({ onboardingDone: false }),
      setReminderMonths: (reminderMonths) => set({ reminderMonths }),
      updateProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),
    }),
    {
      name: 'retinascan.settings',
      storage: createJSONStorage(() => AsyncStorage),
      // `hydrated` décrit l'état du stockage : il n'a pas à y être écrit.
      partialize: ({ hydrated: _, ...rest }) => rest as SettingsState,
      // AsyncStorage est asynchrone : ce rappel s'exécute après l'évaluation du
      // module, `useSettings` est donc déjà défini.
      onRehydrateStorage: () => () => useSettings.setState({ hydrated: true }),
    },
  ),
);
