import { Image } from 'react-native';

export type ImageProbe = {
  width: number;
  height: number;
  /** Taille du fichier en octets, `null` si elle n'a pas pu être lue. */
  bytes: number | null;
};

/** Lit les dimensions réelles d'une image locale ou distante. */
function getSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      // En cas d'échec on renvoie une taille neutre plutôt que de faire
      // échouer toute l'analyse pour un simple défaut de métadonnées.
      () => resolve({ width: 0, height: 0 }),
    );
  });
}

async function getBytes(uri: string): Promise<number | null> {
  try {
    // L'API `File` d'expo-file-system n'existe que sur les plateformes natives.
    const { File } = await import('expo-file-system');
    return new File(uri).size ?? null;
  } catch {
    return null;
  }
}

export async function probeImage(uri: string): Promise<ImageProbe> {
  const [{ width, height }, bytes] = await Promise.all([getSize(uri), getBytes(uri)]);
  return { width, height, bytes };
}
