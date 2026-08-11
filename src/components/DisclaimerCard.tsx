import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { DISCLAIMER_SHORT, DISCLAIMER_TEXT } from '@/data/legal';
import { useTheme } from '@/theme';
import { Txt } from './ui/Text';

export type DisclaimerCardProps = {
  /** Version courte, sur une ligne, pour les bas d'écran. */
  compact?: boolean;
};

/**
 * Mention médicale obligatoire. Présente sur chaque écran qui affiche un
 * résultat : la portée de l'outil doit rester lisible à tout moment.
 */
export function DisclaimerCard({ compact }: DisclaimerCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.surfaceStrong,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          padding: compact ? theme.spacing.md : theme.spacing.lg,
          gap: theme.spacing.md,
        },
      ]}
    >
      <Ionicons
        name="shield-checkmark-outline"
        size={compact ? 16 : 20}
        color={theme.colors.textMuted}
        style={{ marginTop: 1 }}
      />
      <Txt variant={compact ? 'micro' : 'caption'} color="muted" style={styles.text}>
        {compact ? DISCLAIMER_SHORT : DISCLAIMER_TEXT}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', borderWidth: StyleSheet.hairlineWidth * 2 },
  text: { flex: 1 },
});
