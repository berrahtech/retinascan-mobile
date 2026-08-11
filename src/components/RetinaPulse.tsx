import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, RadialGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/theme';

export type RetinaPulseProps = {
  size?: number;
  /** Met l'animation en pause quand l'écran n'est pas visible. */
  active?: boolean;
};

/**
 * Iris animé décoratif : ondes concentriques qui s'échappent d'un œil stylisé.
 * Utilisé comme visuel d'accroche sur l'accueil et l'onboarding.
 */
export function RetinaPulse({ size = 128, active = true }: RetinaPulseProps) {
  const theme = useTheme();

  const wave1 = useSharedValue(0);
  const wave2 = useSharedValue(0);
  const breath = useSharedValue(0);

  useEffect(() => {
    if (!active) return;
    const loop = (value: typeof wave1, delay: number) => {
      value.value = 0;
      value.value = withDelay(
        delay,
        withRepeat(withTiming(1, { duration: 2800, easing: Easing.out(Easing.quad) }), -1, false),
      );
    };
    loop(wave1, 0);
    loop(wave2, 1400);
    breath.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [active, breath, wave1, wave2]);

  // Les deux ondes partagent la même formule, décalées dans le temps.
  const wave1Style = useAnimatedStyle(() => ({
    transform: [{ scale: 0.55 + wave1.value * 0.85 }],
    opacity: (1 - wave1.value) * 0.5,
  }));
  const wave2Style = useAnimatedStyle(() => ({
    transform: [{ scale: 0.55 + wave2.value * 0.85 }],
    opacity: (1 - wave2.value) * 0.5,
  }));

  const irisStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breath.value * 0.035 }],
  }));

  const ring = (styleProp: object, key: string) => (
    <Animated.View key={key} style={[StyleSheet.absoluteFill, styles.centered, styleProp]}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: theme.colors.accent,
        }}
      />
    </Animated.View>
  );

  return (
    <View style={[styles.root, { width: size, height: size }]}>
      {ring(wave1Style, 'w1')}
      {ring(wave2Style, 'w2')}

      <Animated.View style={irisStyle}>
        <Svg width={size * 0.62} height={size * 0.62} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="iris" cx="42%" cy="38%" r="65%">
              <Stop offset="0" stopColor="#E9D5FF" />
              <Stop offset="0.42" stopColor={theme.colors.accent} />
              <Stop offset="0.78" stopColor={theme.colors.primary} />
              <Stop offset="1" stopColor="#4C1D95" />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="50" r="48" fill="url(#iris)" />
          {/* Fibres iriennes. */}
          <G opacity={0.35}>
            {Array.from({ length: 24 }, (_, i) => {
              const angle = (i / 24) * Math.PI * 2;
              return (
                <Circle
                  key={i}
                  cx={50 + Math.cos(angle) * 33}
                  cy={50 + Math.sin(angle) * 33}
                  r={1.6}
                  fill="#1A0B2E"
                />
              );
            })}
          </G>
          <Circle cx="50" cy="50" r="19" fill="#0B0512" />
          <Circle cx="40" cy="38" r="7.5" fill="#FFFFFF" opacity={0.5} />
          <Circle cx="60" cy="62" r="3.5" fill="#E9D5FF" opacity={0.35} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  centered: { alignItems: 'center', justifyContent: 'center' },
});
