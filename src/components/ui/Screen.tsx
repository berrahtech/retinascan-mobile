import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

type ScreenProps = {
  children: React.ReactNode;
  /** Applique la marge haute de la zone sûre. */
  topInset?: boolean;
  /** Retire le dégradé de fond (écrans plein écran type caméra). */
  plain?: boolean;
  style?: ViewStyle;
};

/**
 * Conteneur racine d'un écran : pose le dégradé de fond et la zone sûre.
 */
export function Screen({ children, topInset = true, plain, style }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }, style]}>
      {!plain && (
        <LinearGradient
          colors={[...theme.colors.backgroundGradient]}
          locations={[0, 0.45, 1]}
          style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
        />
      )}
      <View style={[styles.content, topInset && { paddingTop: insets.top }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
