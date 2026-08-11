import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

// Logo officiel de RetinaScan (œil + mot-symbole + slogan), fourni par le client.
// Pour le mettre à jour, remplacez simplement ce fichier PNG.
const LOGO = require('../../assets/images/logg.png');

export type BrandLogoProps = {
  /** Hauteur du logo, en points. Le logo est carré : la largeur suit. */
  height?: number;
  /**
   * Présente le logo sur une tuile blanche arrondie. Recommandé : le logo a un
   * fond blanc, la tuile le rend lisible aussi bien en thème clair que sombre.
   */
  card?: boolean;
  style?: ViewStyle;
};

/**
 * Affiche le logo officiel de l'application.
 *
 * Rendu à partir du fichier image original (`assets/images/logg.png`) : c'est
 * exactement le logo de la marque, non redessiné.
 */
export function BrandLogo({ height = 120, card = true, style }: BrandLogoProps) {
  const theme = useTheme();

  const image = (
    <Image
      source={LOGO}
      style={{ width: height, height }}
      contentFit="contain"
      accessibilityLabel="Logo RetinaScan"
    />
  );

  if (!card) {
    return <View style={style}>{image}</View>;
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: '#FFFFFF',
          borderRadius: theme.radius.xl,
          padding: height * 0.05,
          borderColor: theme.colors.border,
          ...theme.elevation(2),
        },
        style,
      ]}
    >
      {image}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
