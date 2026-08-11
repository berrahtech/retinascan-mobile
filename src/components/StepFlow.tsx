import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/theme';
import { Txt } from './ui/Text';

const STEPS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'camera-outline', label: 'Photographiez' },
  { icon: 'sparkles-outline', label: 'Analyse IA' },
  { icon: 'document-text-outline', label: 'Rapport' },
];

/** Les trois temps du parcours, affichés sur l'accueil et l'onboarding. */
export function StepFlow() {
  const theme = useTheme();

  return (
    <View style={styles.root}>
      {STEPS.map((step, index) => (
        <React.Fragment key={step.label}>
          <Animated.View
            entering={FadeInDown.delay(120 + index * 90).duration(420)}
            style={styles.step}
          >
            <View
              style={[
                styles.bubble,
                {
                  backgroundColor: theme.colors.primarySoft,
                  borderColor: `${theme.colors.primary}44`,
                  borderRadius: theme.radius.lg,
                },
              ]}
            >
              <Ionicons name={step.icon} size={22} color={theme.colors.primary} />
            </View>
            <Txt variant="micro" color="secondary" align="center" style={{ marginTop: 8 }}>
              {step.label}
            </Txt>
          </Animated.View>

          {index < STEPS.length - 1 && (
            <Animated.View
              entering={FadeInDown.delay(170 + index * 90).duration(420)}
              style={styles.connector}
            >
              <View style={[styles.dash, { backgroundColor: theme.colors.borderStrong }]} />
              <Ionicons name="chevron-forward" size={13} color={theme.colors.textMuted} />
            </Animated.View>
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  step: { alignItems: 'center', width: 76 },
  bubble: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  connector: { flex: 1, flexDirection: 'row', alignItems: 'center', marginTop: 25, gap: 4 },
  dash: { flex: 1, height: 1.5, borderRadius: 1 },
});
