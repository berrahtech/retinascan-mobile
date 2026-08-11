import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

/**
 * Ouvre la galerie et renvoie l'URI choisie, ou `null` si l'utilisateur annule
 * ou refuse l'accès. La demande de permission est faite au moment du besoin.
 */
export async function pickRetinaImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    if (permission.canAskAgain === false) {
      Alert.alert(
        'Accès aux photos refusé',
        "Autorisez l'accès à vos photos dans les réglages pour importer une image de rétine.",
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Ouvrir les réglages', onPress: () => Linking.openSettings() },
        ],
      );
    }
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    // Le recadrage carré correspond au champ circulaire d'un rétinographe.
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
    exif: false,
  });

  if (result.canceled || result.assets.length === 0) return null;
  return result.assets[0].uri;
}
