import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';
import { Txt } from './Text';

export type BadgeProps = {
  label: string;
  /** Couleur d'accent ; par défaut, la couleur primaire du thème. */
  tone?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** `solid` remplit le fond, `soft` reste discret, `outline` n'a qu'un contour. */
  variant?: 'soft' | 'solid' | 'outline';
  size?: 'sm' | 'md';
  style?: ViewStyle;
};

/** Étiquette compacte : stade, statut de qualité, mention « nouveau ». */
export function Badge({
  label,
  tone,
  icon,
  variant = 'soft',
  size = 'md',
  style,
}: BadgeProps) {
  const theme = useTheme();
  const accent = tone ?? theme.colors.primary;

  const backgroundColor =
    variant === 'solid' ? accent : variant === 'soft' ? `${accent}22` : 'transparent';
  const textColor = variant === 'solid' ? '#FFFFFF' : accent;
  const iconSize = size === 'sm' ? 11 : 13;

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor,
          borderRadius: theme.radius.pill,
          borderWidth: variant === 'outline' ? StyleSheet.hairlineWidth * 2 : 0,
          borderColor: accent,
          paddingVertical: size === 'sm' ? 3 : 5,
          paddingHorizontal: size === 'sm' ? theme.spacing.sm : theme.spacing.md,
          gap: theme.spacing.xs,
        },
        style,
      ]}
    >
      {icon && <Ionicons name={icon} size={iconSize} color={textColor} />}
      <Txt variant={size === 'sm' ? 'micro' : 'caption'} color={textColor} weight="700">
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
});
