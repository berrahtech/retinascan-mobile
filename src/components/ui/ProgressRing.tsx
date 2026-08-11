import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type ProgressRingProps = {
  /** Valeur affichée, 0..1. */
  progress: number;
  size?: number;
  thickness?: number;
  /** Couleur de départ du dégradé de l'arc. */
  color?: string;
  /** Couleur d'arrivée ; identique à `color` si absente. */
  colorEnd?: string;
  trackColor?: string;
  /** Durée de l'animation vers la nouvelle valeur, en ms. */
  duration?: number;
  /** Contenu centré dans l'anneau. */
  children?: React.ReactNode;
  /** Identifiant unique du dégradé SVG (requis si plusieurs anneaux coexistent). */
  gradientId?: string;
};

/**
 * Anneau de progression animé. Sert au score de qualité, à la confiance du
 * modèle et à la progression de l'analyse.
 */
export function ProgressRing({
  progress,
  size = 120,
  thickness = 10,
  color,
  colorEnd,
  trackColor,
  duration = 900,
  children,
  gradientId = 'ring',
}: ProgressRingProps) {
  const theme = useTheme();
  const accent = color ?? theme.colors.primary;
  const accentEnd = colorEnd ?? accent;

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const animated = useSharedValue(0);

  useEffect(() => {
    animated.value = withTiming(Math.min(1, Math.max(0, progress)), {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [animated, duration, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animated.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={accent} />
            <Stop offset="1" stopColor={accentEnd} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor ?? theme.colors.surfaceStrong}
          strokeWidth={thickness}
          fill="none"
          opacity={theme.scheme === 'dark' ? 0.5 : 1}
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          // Départ à midi plutôt qu'à 3 h.
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}
