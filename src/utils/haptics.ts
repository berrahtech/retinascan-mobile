import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { useSettings } from '@/store/settings';

/**
 * Retours haptiques respectant la préférence utilisateur.
 * Sans effet sur le web, où l'API n'existe pas.
 */
const enabled = () => Platform.OS !== 'web' && useSettings.getState().hapticsEnabled;

const run = (fn: () => Promise<void>) => {
  if (!enabled()) return;
  // Un échec de vibration ne doit jamais interrompre une interaction.
  fn().catch(() => {});
};

export const haptics = {
  /** Appui sur un contrôle secondaire. */
  tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Appui sur une action principale. */
  press: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  /** Déclencheur d'obturateur. */
  shutter: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  /** Franchissement d'un cran (sélecteur, curseur). */
  select: () => run(() => Haptics.selectionAsync()),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
