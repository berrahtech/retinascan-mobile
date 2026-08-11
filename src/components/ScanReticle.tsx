import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/theme';

export type ScanReticleProps = {
  /** Diamètre du cercle de visée. */
  size: number;
  /** Couleur du repère : passe au vert quand le cadrage est jugé bon. */
  tone: string;
  /** Anime le balayage. Mis en pause pendant la capture. */
  active?: boolean;
};

/**
 * Repère de visée de l'écran caméra : masque circulaire, anneau gradué,
 * équerres d'angle et ligne de balayage.
 */
export function ScanReticle({ size, tone, active = true }: ScanReticleProps) {
  const theme = useTheme();
  const sweep = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!active) return;
    sweep.value = 0;
    sweep.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    rotation.value = withRepeat(
      withTiming(1, { duration: 14000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [active, rotation, sweep]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(sweep.value, [0, 1], [-size / 2, size / 2]) }],
    opacity: interpolate(sweep.value, [0, 0.08, 0.92, 1], [0, 1, 1, 0]),
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 360}deg` }],
  }));

  const radius = size / 2;

  return (
    <View style={styles.root}>
      {/* Voile sombre percé d'un disque : une bordure démesurée creuse le trou. */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: 1200,
          borderColor: 'rgba(3,6,14,0.62)',
        }}
      />

      <View style={[styles.centered, { width: size, height: size }]}>
        {/* Balayage lumineux. */}
        <Animated.View style={[styles.sweepWrap, { width: size }, sweepStyle]}>
          <LinearGradient
            colors={['transparent', `${tone}CC`, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sweepLine}
          />
        </Animated.View>

        {/* Anneau gradué en rotation lente. */}
        <Animated.View style={[StyleSheet.absoluteFill, ringStyle]}>
          <Svg width={size} height={size}>
            <Circle
              cx={radius}
              cy={radius}
              r={radius - 8}
              stroke={`${tone}66`}
              strokeWidth={1.5}
              strokeDasharray="3 12"
              fill="none"
            />
          </Svg>
        </Animated.View>

        {/* Cercle de visée principal. */}
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Circle
            cx={radius}
            cy={radius}
            r={radius - 1}
            stroke={tone}
            strokeWidth={2}
            fill="none"
            opacity={0.9}
          />
          {/* Repère central discret pour l'alignement de la macula. */}
          <Circle cx={radius} cy={radius} r={3} fill={tone} opacity={0.5} />
        </Svg>

        {/* Équerres d'angle. */}
        {(
          [
            ['top', 'left'],
            ['top', 'right'],
            ['bottom', 'left'],
            ['bottom', 'right'],
          ] as const
        ).map(([v, h]) => (
          <View
            key={`${v}-${h}`}
            style={[
              styles.corner,
              {
                [v]: -14,
                [h]: -14,
                borderColor: tone,
                borderTopWidth: v === 'top' ? 3 : 0,
                borderBottomWidth: v === 'bottom' ? 3 : 0,
                borderLeftWidth: h === 'left' ? 3 : 0,
                borderRightWidth: h === 'right' ? 3 : 0,
                borderTopLeftRadius: v === 'top' && h === 'left' ? theme.radius.md : 0,
                borderTopRightRadius: v === 'top' && h === 'right' ? theme.radius.md : 0,
                borderBottomLeftRadius: v === 'bottom' && h === 'left' ? theme.radius.md : 0,
                borderBottomRightRadius: v === 'bottom' && h === 'right' ? theme.radius.md : 0,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    // Le repère est purement décoratif : il ne doit pas capter les gestes.
    pointerEvents: 'none',
  },
  centered: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  sweepWrap: { position: 'absolute', height: 3, alignItems: 'center' },
  sweepLine: { width: '86%', height: 3, borderRadius: 2 },
  corner: { position: 'absolute', width: 34, height: 34 },
});
