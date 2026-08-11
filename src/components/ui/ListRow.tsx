import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { PressableScale } from './PressableScale';
import { Txt } from './Text';

export type ListRowProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  /** Teinte de la pastille d'icône. */
  tone?: string;
  title: string;
  subtitle?: string;
  /** Contenu à droite : valeur textuelle ou contrôle. */
  right?: React.ReactNode;
  value?: string;
  onPress?: () => void;
  /** Affiche un chevron. Implicite si `onPress` est fourni sans `right`. */
  chevron?: boolean;
  danger?: boolean;
};

/** Ligne de réglage ou de navigation, densité constante. */
export function ListRow({
  icon,
  tone,
  title,
  subtitle,
  right,
  value,
  onPress,
  chevron,
  danger,
}: ListRowProps) {
  const theme = useTheme();
  const accent = danger ? theme.colors.danger : (tone ?? theme.colors.primary);
  const showChevron = chevron ?? (Boolean(onPress) && !right);

  const content = (
    <View style={[styles.row, { paddingVertical: theme.spacing.md, gap: theme.spacing.md }]}>
      {icon && (
        <View
          style={[
            styles.iconTile,
            { backgroundColor: `${accent}1F`, borderRadius: theme.radius.sm },
          ]}
        >
          <Ionicons name={icon} size={17} color={accent} />
        </View>
      )}
      <View style={styles.labels}>
        <Txt variant="bodyStrong" color={danger ? 'danger' : 'default'} numberOfLines={1}>
          {title}
        </Txt>
        {subtitle && (
          <Txt variant="caption" color="muted" style={{ marginTop: 1 }}>
            {subtitle}
          </Txt>
        )}
      </View>
      {value && (
        <Txt variant="caption" color="secondary" numberOfLines={1}>
          {value}
        </Txt>
      )}
      {right}
      {showChevron && (
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
      )}
    </View>
  );

  if (!onPress) return content;

  return (
    <PressableScale onPress={onPress} activeScale={0.985} accessibilityRole="button">
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  iconTile: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  labels: { flex: 1 },
});
