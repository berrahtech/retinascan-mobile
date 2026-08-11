import React from 'react';
import { StyleSheet, Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { useTheme, type TypographyVariant } from '@/theme';

type ColorKey =
  | 'default'
  | 'secondary'
  | 'muted'
  | 'inverted'
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger';

export type TxtProps = TextProps & {
  variant?: TypographyVariant;
  color?: ColorKey | string;
  align?: TextStyle['textAlign'];
  /** Force une casse en capitales (étiquettes de section). */
  uppercase?: boolean;
  /** Écrase le poids issu de la variante. */
  weight?: TextStyle['fontWeight'];
};

/**
 * Composant texte de l'application : garantit que chaque libellé provient de
 * l'échelle typographique et de la palette du thème.
 */
export function Txt({
  variant = 'body',
  color = 'default',
  align,
  uppercase,
  weight,
  style,
  children,
  ...rest
}: TxtProps) {
  const theme = useTheme();

  const palette: Record<ColorKey, string> = {
    default: theme.colors.text,
    secondary: theme.colors.textSecondary,
    muted: theme.colors.textMuted,
    inverted: theme.colors.textInverted,
    primary: theme.colors.primary,
    accent: theme.colors.accent,
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
  };

  const resolved = (palette as Record<string, string>)[color] ?? color;

  return (
    <RNText
      {...rest}
      style={StyleSheet.flatten([
        theme.typography[variant] as TextStyle,
        { color: resolved },
        align ? { textAlign: align } : null,
        uppercase ? { textTransform: 'uppercase' } : null,
        weight ? { fontWeight: weight } : null,
        style,
      ])}
    >
      {children}
    </RNText>
  );
}
