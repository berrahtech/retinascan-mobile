import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';
import { PressableScale } from './PressableScale';
import { Txt } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Place l'icône après le libellé. */
  iconRight?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Occupe toute la largeur disponible. */
  block?: boolean;
  style?: ViewStyle;
};

const HEIGHT: Record<Size, number> = { sm: 38, md: 48, lg: 56 };
const ICON_SIZE: Record<Size, number> = { sm: 15, md: 18, lg: 20 };

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  disabled,
  block,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const inactive = disabled || loading;

  const textColor =
    variant === 'primary'
      ? theme.colors.primaryText
      : variant === 'danger'
        ? theme.colors.danger
        : variant === 'ghost'
          ? theme.colors.textSecondary
          : theme.colors.text;

  const container: ViewStyle = {
    height: HEIGHT[size],
    paddingHorizontal: size === 'sm' ? theme.spacing.lg : theme.spacing.xxl,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    overflow: 'hidden',
    alignSelf: block ? 'stretch' : 'flex-start',
    opacity: inactive ? 0.55 : 1,
    backgroundColor:
      variant === 'secondary'
        ? theme.colors.surfaceStrong
        : variant === 'danger'
          ? theme.colors.dangerSoft
          : 'transparent',
    borderWidth: variant === 'ghost' ? 0 : StyleSheet.hairlineWidth * 2,
    borderColor:
      variant === 'secondary'
        ? theme.colors.border
        : variant === 'danger'
          ? `${theme.colors.danger}55`
          : 'transparent',
    ...(variant === 'primary' ? theme.elevation(2) : {}),
  };

  const inner = (
    <>
      {variant === 'primary' && (
        <LinearGradient
          colors={[...theme.colors.primaryGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={[styles.row, { gap: theme.spacing.sm }]}>
          {icon && !iconRight && (
            <Ionicons name={icon} size={ICON_SIZE[size]} color={textColor} />
          )}
          <Txt
            variant={size === 'sm' ? 'caption' : 'subheading'}
            color={textColor}
            weight="700"
            numberOfLines={1}
          >
            {label}
          </Txt>
          {icon && iconRight && (
            <Ionicons name={icon} size={ICON_SIZE[size]} color={textColor} />
          )}
        </View>
      )}
    </>
  );

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(inactive), busy: Boolean(loading) }}
      disabled={inactive}
      onPress={onPress}
      feedback={variant === 'primary' ? 'press' : 'tap'}
      activeScale={0.97}
      style={[container, style ?? {}]}
    >
      {inner}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
