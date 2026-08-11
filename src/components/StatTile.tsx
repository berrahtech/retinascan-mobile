import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { AnimatedNumber } from './ui/AnimatedNumber';
import { Txt } from './ui/Text';

export type StatTileProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  /** Valeur numérique animée. Ignorée si `text` est fourni. */
  value?: number;
  /** Valeur textuelle, pour les mesures non chiffrées. */
  text?: string;
  suffix?: string;
  tone?: string;
};

/** Indicateur compact du tableau de bord. */
export function StatTile({ icon, label, value, text, suffix, tone }: StatTileProps) {
  const theme = useTheme();
  const accent = tone ?? theme.colors.primary;

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.scheme === 'dark' ? theme.colors.surface : theme.colors.surfaceSolid,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          ...theme.elevation(1),
        },
      ]}
    >
      <View
        style={[
          styles.icon,
          { backgroundColor: `${accent}1F`, borderRadius: theme.radius.xs },
        ]}
      >
        <Ionicons name={icon} size={14} color={accent} />
      </View>

      {text !== undefined ? (
        <Txt variant="heading" numberOfLines={1} style={{ marginTop: theme.spacing.sm }}>
          {text}
        </Txt>
      ) : (
        <View style={[styles.valueRow, { marginTop: theme.spacing.sm }]}>
          <AnimatedNumber value={value ?? 0} variant="heading" />
          {suffix && (
            <Txt variant="caption" color="muted" style={{ marginBottom: 3 }}>
              {suffix}
            </Txt>
          )}
        </View>
      )}

      <Txt variant="micro" color="muted" numberOfLines={1} style={{ marginTop: 2 }}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, borderWidth: StyleSheet.hairlineWidth * 2 },
  icon: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
});
