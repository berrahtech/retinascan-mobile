import React, { useCallback } from 'react';
import { Pressable, type PressableProps, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';
import { haptics } from '@/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: ViewStyle | ViewStyle[];
  /** Échelle atteinte pendant l'appui. */
  activeScale?: number;
  /** Opacité atteinte pendant l'appui. */
  activeOpacity?: number;
  /** Retour haptique déclenché à l'appui. `null` pour aucun. */
  feedback?: 'tap' | 'press' | 'select' | null;
  children?: React.ReactNode;
};

/**
 * Zone tactile qui s'enfonce légèrement à l'appui.
 * C'est le geste de base de toute l'application : boutons, cartes, lignes de
 * liste passent tous par ici pour que le toucher réponde de la même façon.
 */
export function PressableScale({
  style,
  activeScale = 0.965,
  activeOpacity = 0.92,
  feedback = 'tap',
  onPressIn,
  children,
  ...rest
}: PressableScaleProps) {
  const theme = useTheme();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(1 - pressed.value * (1 - activeScale), theme.motion.spring) },
    ],
    opacity: withSpring(1 - pressed.value * (1 - activeOpacity), theme.motion.spring),
  }));

  const handlePressIn = useCallback<NonNullable<PressableProps['onPressIn']>>(
    (event) => {
      pressed.value = 1;
      if (feedback) haptics[feedback]();
      onPressIn?.(event);
    },
    [feedback, onPressIn, pressed],
  );

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={(event) => {
        pressed.value = 0;
        rest.onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
