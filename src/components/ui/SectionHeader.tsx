import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { PressableScale } from './PressableScale';
import { Txt } from './Text';

export type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  /** Lien d'action à droite du titre. */
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, subtitle, actionLabel, onAction }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.root, { marginBottom: theme.spacing.md }]}>
      <View style={styles.titles}>
        <Txt variant="heading">{title}</Txt>
        {subtitle && (
          <Txt variant="caption" color="muted" style={{ marginTop: 2 }}>
            {subtitle}
          </Txt>
        )}
      </View>
      {actionLabel && onAction && (
        <PressableScale
          onPress={onAction}
          activeScale={0.94}
          style={[styles.action, { gap: theme.spacing.xxs }]}
        >
          <Txt variant="caption" color="primary" weight="700">
            {actionLabel}
          </Txt>
          <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  titles: { flex: 1, paddingRight: 12 },
  action: { flexDirection: 'row', alignItems: 'center' },
});
