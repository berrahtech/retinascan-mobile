import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';
import { PressableScale } from './PressableScale';

export type CardProps = {
  children: React.ReactNode;
  /** Rend la carte tactile. */
  onPress?: () => void;
  /** `flat` supprime bordure et ombre ; `glow` ajoute un liseré teinté. */
  variant?: 'default' | 'flat' | 'glow';
  /** Teinte du liseré en variante `glow`. */
  tone?: string;
  padding?: number;
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
};

/**
 * Surface de contenu. C'est l'unité de composition principale des écrans :
 * même rayon, même bordure, même densité partout.
 */
export function Card({
  children,
  onPress,
  variant = 'default',
  tone,
  padding,
  style,
  accessibilityLabel,
}: CardProps) {
  const theme = useTheme();
  const accent = tone ?? theme.colors.primary;

  const base: ViewStyle = {
    borderRadius: theme.radius.lg,
    padding: padding ?? theme.spacing.lg,
    backgroundColor:
      theme.scheme === 'dark' ? theme.colors.surface : theme.colors.surfaceSolid,
    borderWidth: variant === 'flat' ? 0 : StyleSheet.hairlineWidth * 2,
    borderColor: variant === 'glow' ? `${accent}55` : theme.colors.border,
    overflow: 'hidden',
    ...(variant === 'flat' ? {} : theme.elevation(1)),
  };

  const content = (
    <>
      {variant === 'glow' && (
        <LinearGradient
          colors={[`${accent}1F`, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
        />
      )}
      {children}
    </>
  );

  if (onPress) {
    return (
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={[base, ...(Array.isArray(style) ? style : [style ?? {}])]}
      >
        {content}
      </PressableScale>
    );
  }

  return <View style={[base, style]}>{content}</View>;
}
