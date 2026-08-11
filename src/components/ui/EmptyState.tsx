import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { Button } from './Button';
import { Txt } from './Text';

export type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.root, { paddingVertical: theme.spacing.huge }]}>
      <View
        style={[
          styles.icon,
          {
            backgroundColor: theme.colors.primarySoft,
            borderRadius: theme.radius.xxl,
            marginBottom: theme.spacing.lg,
          },
        ]}
      >
        <Ionicons name={icon} size={30} color={theme.colors.primary} />
      </View>
      <Txt variant="subheading" align="center">
        {title}
      </Txt>
      <Txt
        variant="body"
        color="muted"
        align="center"
        style={{ marginTop: theme.spacing.xs, maxWidth: 300 }}
      >
        {message}
      </Txt>
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          style={{ marginTop: theme.spacing.xl }}
          size="md"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  icon: { width: 68, height: 68, alignItems: 'center', justifyContent: 'center' },
});
